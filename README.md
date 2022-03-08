# UnityConnectNamedPipe-KuandoHUB

Program to read from Unity Desktop Client (Phone system supplied to businesses from TDC Denmark)

REQUIRES:
  - node.js to be installed on the PC
  - Unity Client and KuandoHUB programs to be running

PROCESS SUMMARY:
 - Finds named pipe created by unity desktop client
 - Listens for changes to the named pipe
 - Uses HTTP-calls to the standard port used by KuandoHUB to change color of Plenom Kuando Busylight based on the status in the named pipe

KUANDO HUB SETTINGS:
 - HTTP Server ON
 - HTTP must be listed as Platform Priority

KNOWN ISSUES:
 - Light color will not be set by script untill first event is detected after script starts (No initial value)
 - Light will change to green whenever a call is ended, even if another call is in progress
 - Light will change to yellow whenever an incoming call is alerting, even if another call is in progress
