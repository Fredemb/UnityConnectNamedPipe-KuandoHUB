# UnityConnectNamedPipe-KuandoHUB

Program to read from Unity Desktop Client (Phone system supplied to businesses from TDC Denmark)
REQUIRES:
  -node.js to be installed on the PC
  -Unity Client and KuandoHUB programs to be running

Finds named pipe created by unity desktop client
Listens for changes to the named pipe
Uses HTTP-calls to the standard port used by KuandoHUB to change color of Plenom Kuando Busylight based on the status in the named pipe
