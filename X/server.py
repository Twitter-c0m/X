import http.server
import socketserver
import json

PORT = 3000
DB_FILE = 'db.json'

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path in ('/db', '/users'):
            try:
                with open(DB_FILE, 'r') as f:
                    data = json.load(f)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
            except FileNotFoundError:
                self.send_error(404, f"File not found: {DB_FILE}")
            except json.JSONDecodeError:
                self.send_error(500, f"Error decoding JSON from {DB_FILE}")
        else:
            # Serve files from the current directory for any other path
            super().do_GET()

    def do_POST(self):
        if self.path == '/users':
            import os
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                new_user = json.loads(post_data.decode('utf-8'))
                if os.path.exists(DB_FILE):
                    with open(DB_FILE, 'r') as f:
                        db_data = json.load(f)
                else:
                    db_data = {"users": []}
                
                if "users" not in db_data:
                    db_data["users"] = []

                users_list = db_data["users"]
                new_id = max([u.get('id', 0) for u in users_list]) + 1 if users_list else 1
                new_user['id'] = new_id

                db_data["users"].append(new_user)
                with open(DB_FILE, 'w') as f:
                    json.dump(db_data, f, indent=2)

                self.send_response(201)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(new_user).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    print(f"Access your data at http://localhost:{PORT}/users or http://localhost:{PORT}/db")
    httpd.serve_forever()
