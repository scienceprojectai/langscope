import os
import yaml
import logging
import json
from datetime import datetime
from pymongo import MongoClient
from azure.storage.blob import BlobServiceClient
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("LangScope-ETL")

class DataLakeETL:
    def __init__(self, config_path="config.yaml"):
        # 1. Load Config
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)
        
        # 2. Init MongoDB
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            raise ValueError("MONGO_URI environment variable is missing!")
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client["langscope"]
        self.domains_collection = self.db["domains"]

        # 3. Init Azure Datalake
        azure_conn_str = os.getenv("AZURE_STORAGE_CONN_STR")
        if not azure_conn_str:
            raise ValueError("AZURE_STORAGE_CONN_STR environment variable is missing!")
        self.blob_service = BlobServiceClient.from_connection_string(azure_conn_str)
        self.container_client = self.blob_service.get_container_client(self.config['pipeline']['datalake_container'])
        
        # Ensure datalake container exists
        if not self.container_client.exists():
            self.container_client.create_container()

    def get_domains(self):
        target = self.config['pipeline']['target_domains']
        query = {} if target == "*" else {"Domain": {"$in": target}}
        return list(self.domains_collection.find(query))

    def get_limit_bytes(self):
        limit_mb = self.config['limits']['default_max_mb']
        return limit_mb * 1024 * 1024

    def process_domain(self, domain):
        name = domain.get('Domain', 'Unknown')
        url = domain.get('Data Source URL', '')
        
        if not url or str(url).lower() == 'nan':
            logger.warning(f"[{name}] No URL found in DB. Skipping.")
            return False

        limit_bytes = self.get_limit_bytes()
        
        try:
            logger.info(f"[{name}] Starting sync. Limit: {limit_bytes / (1024*1024):.0f}MB")
            
            if "huggingface.co" in url:
                outcome = self.download_huggingface(url, name, limit_bytes)
            else:
                outcome = {"status": "SKIPPED", "bytes_saved": 0} 
                
            self.update_db(domain['_id'], outcome['status'], outcome['bytes_saved'])
            return True
        except Exception as e:
            logger.error(f"[{name}] Sync failed: {str(e)}")
            self.update_db(domain['_id'], "FAILED", 0)
            return False

    def download_huggingface(self, url, domain_name, limit_bytes):
        from datasets import load_dataset
        dataset_id = url.split("datasets/")[-1]
        bytes_saved = 0
        status = "FULL"
        
        safe_name = domain_name.replace("/", "_").replace(" ", "_")
        blob_name = f"raw/{safe_name}/data.jsonl"
        
        stream = load_dataset(dataset_id, streaming=True, split="train", trust_remote_code=True)
        records = []
        
        for row in stream:
            row_bytes = len(json.dumps(row).encode('utf-8'))
            
            if bytes_saved + row_bytes > limit_bytes:
                status = "SUBSET"
                break
                
            records.append(json.dumps(row))
            bytes_saved += row_bytes
            
            if bytes_saved >= 5 * 1024 * 1024:
                self._upload_chunk(blob_name, records)
                records = [] 
                
        if records:
            self._upload_chunk(blob_name, records)
            
        return {"status": status, "bytes_saved": bytes_saved}

    def _upload_chunk(self, blob_name, records):
        blob_client = self.container_client.get_blob_client(blob_name)
        data_str = "\n".join(records) + "\n"
        
        if blob_client.exists():
            blob_client.append_block(data_str)
        else:
            blob_client.upload_blob(data_str, blob_type="AppendBlob")

    def update_db(self, doc_id, status, bytes_saved):
        self.domains_collection.update_one(
            {"_id": doc_id},
            {"$set": {
                "download_status": status,
                "datalake_size_bytes": bytes_saved,
                "last_sync_date": datetime.utcnow()
            }}
        )

    def trigger_battle_arena(self):
        downstream = self.config.get('downstream_tasks', {})
        if not downstream.get('trigger_battle_arena', False):
            logger.info("Battle Arena trigger disabled in config. Run complete.")
            return

        job_name = downstream.get('battle_arena_job_name')
        logger.info(f"Data refresh complete! Ready to spin off downstream job: {job_name}...")

    def run(self):
        domains = self.get_domains()
        threads = self.config['pipeline']['threads']
        logger.info(f"Processing {len(domains)} domains using {threads} threads.")
        
        with ThreadPoolExecutor(max_workers=threads) as executor:
            futures = [executor.submit(self.process_domain, d) for d in domains]
            for future in as_completed(futures):
                future.result()
                
        self.trigger_battle_arena()

if __name__ == "__main__":
    DataLakeETL().run()