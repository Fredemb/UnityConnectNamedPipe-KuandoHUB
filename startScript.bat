::Timeout to ensure the programs we depend on have time to initialize, if started simultaniously with this script
timeout 120 
node "%~dp0\readNamedPipe.js"
