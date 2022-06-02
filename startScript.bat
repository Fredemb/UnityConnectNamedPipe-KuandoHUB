::Timeout to ensure the programs we depend on have time to initialize, if started simultaniously with this script
timeout 60 
node "%~dp0\readNamedPipe.js"