import os
import subprocess
import glob

os.chdir(r"E:\Misr-Living-Memory-Source\ehky-ya-misr")

# Get list of uncommitted files
out = subprocess.check_output(["git", "status", "--porcelain"], text=True)
untracked = []
for line in out.splitlines():
    line = line.strip()
    if line.startswith("??") or line.startswith("A"):
        path = line[3:].strip().strip('"')
        if os.path.isfile(path):
            untracked.append(path)

print(f"Total remaining files to push: {len(untracked)}")

# Process in chunks of 5 files
chunk_size = 5
for i in range(0, len(untracked), chunk_size):
    chunk = untracked[i:i + chunk_size]
    print(f"\n--- Processing Chunk {i//chunk_size + 1}: {len(chunk)} files ---")
    for f in chunk:
        subprocess.check_call(["git", "add", f])
    
    commit_msg = f"feat(assets): add assets batch {i//chunk_size + 1}"
    subprocess.check_call(["git", "commit", "-m", commit_msg])
    
    # Push with retry
    pushed = False
    for attempt in range(1, 4):
        print(f"Pushing batch {i//chunk_size + 1} (attempt {attempt})...")
        res = subprocess.run(["git", "push", "origin", "main"])
        if res.returncode == 0:
            print(f"Batch {i//chunk_size + 1} pushed successfully!")
            pushed = True
            break
        else:
            print(f"Push attempt {attempt} failed, retrying...")
    
    if not pushed:
        print(f"Failed to push batch {i//chunk_size + 1}. Stopping.")
        break

print("\nAll batches finished!")

