import typer
import subprocess
import os
import signal
import sys
from rich.console import Console
from rich.panel import Panel

app = typer.Typer(no_args_is_help=True)
console = Console()

@app.callback()
def main():
    """
    AirOS Reliability Control.
    """
    pass

@app.command()
def dashboard():
    """
    Launch the AirOS Dashboard (Frontend + Backend).
    """
    console.print(Panel.fit("Starting AirOS Reliability Center...", style="bold blue"))
    
    # Paths
    base_dir = os.getcwd()
    dashboard_dir = os.path.join(base_dir, "dashboard")
    
    # 1. Start Python API Server (Uvicorn)
    # We run it as a module or direct script. 
    # Since dashboard/api_server.py exists, we can run "python dashboard/api_server.py"
    # But we need uvicorn. "uvicorn dashboard.api_server:app" works if in root.
    console.print("[green]• Launching API Server on port 8000...[/green]")
    api_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "dashboard.api_server:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=base_dir,
        # stdout=subprocess.DEVNULL, # Show output for debug
        # stderr=subprocess.DEVNULL
    )

    # 2. Start Next.js Frontend
    console.print("[green]• Launching Dashboard UI on port 3000...[/green]")
    # Check if node_modules exists
    if not os.path.exists(os.path.join(dashboard_dir, "node_modules")):
         console.print("[yellow]! Installing frontend dependencies first...[/yellow]")
         subprocess.run(["npm", "install"], cwd=dashboard_dir)

    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=dashboard_dir,
        # stdout=subprocess.DEVNULL,
        # stderr=subprocess.DEVNULL
    )

    console.print(Panel("AirOS Dashboard is Live!\n[bold]http://localhost:3000[/bold]", style="green"))

    try:
        api_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        console.print("\n[yellow]Shutting down AirOS...[/yellow]")
        api_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    app()
