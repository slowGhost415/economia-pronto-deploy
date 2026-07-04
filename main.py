# -*- coding: utf-8 -*-
"""
Main script para executar todo o sistema web de economia.
Inicia o backend (Node.js/Express) e frontend (React/Vite) simultaneamente.
Compativel com Windows e caminhos com espacos.
"""

import subprocess
import sys
import os
import time

def check_command(command, name):
    """Verifica se um comando esta disponivel."""
    try:
        if os.name == 'nt':
            if command == 'node':
                cmd_to_try = r'C:\Program Files\nodejs\node.exe'
                result = subprocess.run([cmd_to_try, '--version'], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    print(f"[OK] {name} encontrado")
                    return True
            elif command == 'npm':
                cmd_to_try = r'C:\Program Files\nodejs\npm.cmd'
                result = subprocess.run([cmd_to_try, '--version'], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    print(f"[OK] {name} encontrado")
                    return True
            result = subprocess.run([command, '--version'], capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print(f"[OK] {name} encontrado")
                return True
        else:
            result = subprocess.run([command, '--version'], capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print(f"[OK] {name} encontrado")
                return True

        print(f"[ERRO] {name} nao encontrado!")
        return False
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        print(f"[ERRO] {name} nao encontrado!")
        return False

def run_command(cmd, cwd=None):
    """Executa um comando."""
    try:
        if os.name == 'nt':
            if cmd.startswith('npm '):
                cmd = cmd.replace('npm ', 'C:\\PROGRA~1\\Nodejs\\npm.cmd ', 1)

        env = os.environ.copy()
        if os.name == 'nt':
            env['PATH'] = env.get('PATH', '') + ';C:\\Program Files\\nodejs'

        if os.name == 'nt':
            return subprocess.Popen(
                cmd,
                shell=True,
                cwd=cwd,
                env=env,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if hasattr(subprocess, 'CREATE_NEW_PROCESS_GROUP') else 0
            )
        else:
            return subprocess.Popen(cmd, shell=True, cwd=cwd, env=env)
    except Exception as e:
        print(f"Erro ao executar comando '{cmd}': {e}")
        return None

def main():
    print("Iniciando sistema completo de economia...")
    print(f"Diretorio do projeto: {os.getcwd()}")
    print()

    print("Limpando processos Node.js anteriores...")
    try:
        if os.name == 'nt':
            os.system('taskkill /F /IM node.exe /T 2>nul')
        time.sleep(2)
    except:
        pass

    print()

    print("Verificando dependencias...")

    node_ok = check_command('node', 'Node.js')
    npm_ok = check_command('npm', 'npm')

    print(f"[OK] Python encontrado ({sys.executable})")

    if not node_ok:
        print("Instale o Node.js em: https://nodejs.org/")
        sys.exit(1)

    if not npm_ok:
        print("[ERRO] npm nao encontrado")
        sys.exit(1)

    print()

    project_dir = os.path.abspath(os.getcwd())
    backend_dir = os.path.join(project_dir, 'backend')
    frontend_dir = os.path.join(project_dir, 'frontend')

    if not os.path.exists(backend_dir):
        print(f"[ERRO] Diretorio 'backend' nao encontrado: {backend_dir}")
        sys.exit(1)

    if not os.path.exists(frontend_dir):
        print(f"[ERRO] Diretorio 'frontend' nao encontrado: {frontend_dir}")
        sys.exit(1)

    print("Estrutura verificada com sucesso")
    print()

    print("Iniciando backend (Express)...")
    backend_process = run_command('npm run dev', cwd=backend_dir)

    if backend_process is None:
        print("[ERRO] Falha ao iniciar backend!")
        sys.exit(1)

    print("Aguardando backend iniciar (10 segundos)...")
    time.sleep(10)

    print("Iniciando frontend (Vite)...")
    frontend_process = run_command('npm run dev', cwd=frontend_dir)

    if frontend_process is None:
        print("[ERRO] Falha ao iniciar frontend!")
        backend_process.terminate()
        sys.exit(1)

    print()
    print("Sistema iniciado com sucesso!")
    print("Backend:  http://localhost:4000")
    print("Frontend: http://localhost:5173")
    print()
    print("Pressione Ctrl+C para parar tudo...")
    print()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nEncerrando sistema...")

        backend_process.terminate()
        frontend_process.terminate()

        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()

        try:
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            frontend_process.kill()

        print("Sistema encerrado!")

if __name__ == "__main__":
    main()
