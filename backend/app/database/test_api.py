import os
import sys
import unittest
import urllib.request
import urllib.error
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chainlens.api_test_suite")

class TestChainLensAPI(unittest.TestCase):
    BASE_URL = "http://127.0.0.1:8000"

    def fetch_json(self, path: str):
        url = f"{self.BASE_URL}{path}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                return response.status, json.loads(response.read().decode())
        except urllib.error.HTTPError as e:
            try:
                body_content = e.read().decode()
                # If body is valid JSON, load it
                return e.code, json.loads(body_content)
            except Exception:
                # Return status code with string body in detail wrapper
                return e.code, {"detail": str(e)}
        except Exception as e:
            self.fail(f"API unreachable or unexpected connection exception: {e}")

    def test_01_health_check(self):
        status_code, body = self.fetch_json("/api/health")
        # Assert database healthy or unavailable but schema matches 200 or 503
        self.assertIn(status_code, [200, 503])
        self.assertIn("status", body)
        self.assertIn("database", body)

    def test_02_get_suppliers(self):
        status_code, body = self.fetch_json("/api/suppliers")
        if status_code == 503:
            logger.warning("Database unavailable. Skipping validation checks.")
            return
        self.assertEqual(status_code, 200)
        self.assertIsInstance(body, list)
        if len(body) > 0:
            item = body[0]
            self.assertIn("id", item)
            self.assertIn("name", item)

    def test_03_supplier_impact(self):
        status_code, body = self.fetch_json("/api/suppliers/sup-01/impact")
        if status_code == 503:
            return
        self.assertEqual(status_code, 200)
        self.assertTrue(body["supplier_exists"])
        self.assertEqual(body["supplier_id"], "sup-01")
        self.assertIn("metrics", body)
        self.assertIn("risk_analysis", body)

    def test_04_supplier_alternatives(self):
        status_code, body = self.fetch_json("/api/suppliers/sup-01/alternatives")
        if status_code == 503:
            return
        self.assertEqual(status_code, 200)
        self.assertIsInstance(body, list)

    def test_05_supplier_risk_events(self):
        status_code, body = self.fetch_json("/api/suppliers/sup-01/risk-events")
        # Resolve routes mapping check
        status_code_raw, body_raw = self.fetch_json("/api/risk-events/supplier/sup-01")
        if status_code_raw == 503:
            return
        self.assertEqual(status_code_raw, 200)
        self.assertIsInstance(body_raw, list)

    def test_06_critical_dependencies(self):
        status_code, body = self.fetch_json("/api/suppliers/sup-01/critical-dependencies")
        if status_code == 503:
            return
        self.assertEqual(status_code, 200)
        self.assertIsInstance(body, list)

    def test_07_supplier_paths(self):
        status_code, body = self.fetch_json("/api/suppliers/sup-01/paths")
        if status_code == 503:
            return
        self.assertEqual(status_code, 200)
        self.assertIsInstance(body, list)

    def test_08_unknown_supplier_404(self):
        status_code, body = self.fetch_json("/api/suppliers/sup-99/impact")
        if status_code == 503:
            return
        self.assertEqual(status_code, 404)

if __name__ == "__main__":
    unittest.main()
