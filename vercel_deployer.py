import os
import sys
import json
import base64
import urllib.request
import urllib.error

def deploy_to_vercel(token, project_name="health-guard-ai"):
    token = token.strip()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "HealthGuard-Vercel-Deployer"
    }

    # Step 1: Verify user
    try:
        user_req = urllib.request.Request("https://api.vercel.com/v2/user", headers=headers)
        with urllib.request.urlopen(user_req, timeout=10) as ures:
            user_data = json.loads(ures.read().decode('utf-8'))
            username = user_data.get("user", {}).get("username") or user_data.get("user", {}).get("email") or "User"
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        return {"success": False, "error": f"Invalid Vercel Token (HTTP {e.code}): {err_msg}"}
    except Exception as e:
        return {"success": False, "error": f"User verification failed: {str(e)}"}

    # Step 2: Prepare files
    base_dir = r"C:\Users\ASUS\Desktop\health-guard-ai"
    files_payload = []
    
    file_list = ["index.html", "README.md"]
    for fname in file_list:
        fpath = os.path.join(base_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "rb") as f:
                b64 = base64.b64encode(f.read()).decode('utf-8')
                files_payload.append({
                    "file": fname,
                    "data": b64,
                    "encoding": "base64"
                })

    # Step 3: Create deployment
    deploy_url = "https://api.vercel.com/v13/deployments"
    payload = {
        "name": project_name,
        "files": files_payload,
        "projectSettings": {
            "framework": None
        }
    }
    
    req_data = json.dumps(payload).encode('utf-8')
    deploy_req = urllib.request.Request(deploy_url, data=req_data, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(deploy_req, timeout=15) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            url = res_data.get("url")
            live_url = f"https://{url}" if url and not url.startswith("http") else url
            return {
                "success": True,
                "username": username,
                "project_name": project_name,
                "deployment_id": res_data.get("id"),
                "url": live_url,
                "dashboard_url": f"https://vercel.com/{username}/{project_name}"
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        return {"success": False, "error": f"Vercel Deployment Failed (HTTP {e.code}): {err_msg}"}
    except Exception as e:
        return {"success": False, "error": f"Deployment error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        token = sys.argv[1].strip()
        print(json.dumps(deploy_to_vercel(token), indent=2))
    else:
        print("Usage: python vercel_deployer.py <VERCEL_TOKEN>")
