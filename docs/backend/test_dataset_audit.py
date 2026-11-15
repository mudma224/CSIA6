"""Stdlib test for check-datasets.py; run: python -m unittest discover -s scripts -p 'test_*.py'"""
import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name('check-datasets.py')
spec = importlib.util.spec_from_file_location('dataset_audit', SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

class ManifestAuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / 'sample.csv').write_text('x\n1\n', encoding='utf-8')
        self.row = {key: 'REVIEW-ME' for key in module.REQUIRED}
        self.row['id'] = 'sample'
        self.row['path'] = 'sample.csv'

    def tearDown(self):
        self.temp.cleanup()

    def test_metadata_and_file_present(self):
        self.assertEqual([], module.audit({'datasets': [self.row]}, self.root))

    def test_missing_metadata_rejected(self):
        row = dict(self.row)
        del row['license']
        self.assertTrue(any('missing license' in x for x in module.audit({'datasets': [row]}, self.root)))

    def test_path_outside_data_root_rejected(self):
        row = dict(self.row, path='../other.csv')
        self.assertTrue(any('escapes root' in x for x in module.audit({'datasets': [row]}, self.root)))

    def test_no_dataset_rejected(self):
        self.assertTrue(module.audit({'datasets': []}, self.root))

if __name__ == '__main__':
    unittest.main()
