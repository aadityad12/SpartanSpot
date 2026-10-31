import argparse
import json
import logging
import math
import os
import sqlite3
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from app.config import DATABASE_PATH


def observation_time(value):
    try:
        timestamp = datetime.fromisoformat(value)
        return timestamp.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        return None


def parking_feed(database_path, max_age=60):
    now = datetime.now(timezone.utc)
    rows = []
    database_path = Path(database_path).resolve()
    if database_path.exists():
        with sqlite3.connect(f'{database_path.as_uri()}?mode=ro', uri=True, timeout=3) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                'SELECT status, updated_at FROM parking_spots'
            ).fetchall()

    available = 0
    occupied = 0
    latest = None
    for row in rows:
        observed = observation_time(row['updated_at'])
        if observed is None:
            continue
        age = (now - observed).total_seconds()
        if age < 0 or age > max_age:
            continue
        if latest is None or observed > latest:
            latest = observed
        if row['status'] == 'available':
            available += 1
        elif row['status'] == 'occupied':
            occupied += 1

    updated_at = latest.isoformat() if latest else None
    return {
        'mode': 'live',
        'updatedAt': updated_at,
        'lots': [{
            'id': 'camera-lot',
            'name': os.getenv('PARKING_LOT_NAME', 'Camera-monitored lot'),
            'subtitle': 'Camera detections · Counts are estimates',
            'available': available,
            'total': len(rows),
            'unknown': len(rows) - available - occupied,
            'walkMinutes': None,
            'permit': os.getenv('PARKING_PERMIT_LABEL', 'Check posted permit requirements'),
            'tags': [],
            'mapX': 65,
            'mapY': 45,
            'destination': os.getenv('PARKING_DESTINATION') or None,
            'updatedAt': updated_at,
        }],
    }


def create_handler(database_path, max_age=60, cors_origin=None):
    class ParkingHandler(BaseHTTPRequestHandler):
        def send_json(self, status, payload):
            body = json.dumps(payload).encode('utf-8')
            self.send_response(status)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            if cors_origin and self.headers.get('Origin') == cors_origin:
                self.send_header('Access-Control-Allow-Origin', cors_origin)
                self.send_header('Vary', 'Origin')
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            path = urlsplit(self.path).path
            if path == '/api/health':
                self.send_json(200, {'status': 'ok'})
            elif path == '/api/lots':
                try:
                    self.send_json(200, parking_feed(database_path, max_age))
                except (sqlite3.Error, OSError):
                    logging.exception('Could not read parking observations')
                    self.send_json(503, {'error': 'Parking observations are temporarily unavailable.'})
            else:
                self.send_json(404, {'error': 'Not found'})

    return ParkingHandler


def main():
    parser = argparse.ArgumentParser(description='Read-only Spartan Spot mobile parking API')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--database', type=Path, default=DATABASE_PATH)
    parser.add_argument('--max-age', type=float, default=60)
    parser.add_argument('--cors-origin', help='Exact allowed web preview origin, e.g. http://localhost:8081')
    args = parser.parse_args()
    if not math.isfinite(args.max_age) or not 0 < args.max_age <= 60:
        parser.error('--max-age must be greater than zero and no more than 60 seconds')
    server = ThreadingHTTPServer((args.host, args.port), create_handler(args.database, args.max_age, args.cors_origin))
    print(f'Spartan Spot parking API: http://{args.host}:{args.port}', flush=True)
    print('Local/trusted-network development server. Add HTTPS and authentication before public use.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
