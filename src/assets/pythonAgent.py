#!/usr/bin/python3

'''
Siemstress Agent
Sends updates and log data to siemstress server

Written by Christopher Grabda for Brickhack
'''
import json
import re
import subprocess
import time
import urllib


URL = "https://siemless.tech"

def post(command, data):
    '''
    sends information to server
    if action is within the response, e.g. report is called, the requested information is sent

    commands:
    agentUpdate {id: number, agentToken: string, cpu: number, memory: number, netIn: number, netOut: number, disk: number}
    actionSss
    '''
    dataEncoded = urllib.parse.urlencode(data).encode()
    req =  urllib.request.Request('%%HOSTNAME%%' + command + "/" + '%%AGENTID%%'+ "/" + '%%AGENT_KEY%%', dataEncoded) 
    headers = req.info().headers

    if (json.loads(headers)["action"] == "ssh"):
        data = sshStats(parseAuth()[0])
        post('actionSsh', json.dumps(data))


def agentUpdate():
    '''
    Updates the server about system metrics 
    cpu usage, memory usage, network in and out bandwidth, and disk utilization
    '''
    # gets the cpu usage and displays in percentage using /proc/stat
    with open("/proc/stat") as file:
        tokens = file.readline().split(" ")
        cpu = round(((int(tokens[2])+int(tokens[4])) / (int(tokens[2])+int(tokens[4])+int(tokens[5]))) * 100, 2)

    # gets the memory usage and displays in percentage /proc/meminfo
    with open("/proc/meminfo") as file:
        totalMem = re.compile(r"\d*\d").findall(file.readline())
        file.readline()
        availableMem = re.compile(r"\d*\d").findall(file.readline())
        memory = round(((int(totalMem[0]) - int(availableMem[0])) / int(totalMem[0]))*100, 2)

    # gets the network inbound and outbound byte totals using /proc/net/netstat
    with open("/proc/net/netstat") as file:
        tokens = file.readlines()[3].split(" ")
        inBytes = tokens[7]
        outBytes = tokens[8]
    
    # gets the disk usage using df command
    # I tried to reverse df instead using a call but it uses C black magic, coreutils command fsusage.c
    output = re.compile("\/.*\/[\r\n]+").findall(bytes.decode(subprocess.check_output(["df"])))[0]
    diskUsage = re.compile("\d+\%").findall(output)[0][:-1]

    # build json data structure
    data = {
        "cpu":cpu,
        "memory":memory,
        "netIn":inBytes,
        "netOut":outBytes,
        "disk":diskUsage
    }

    post('agentUpdate', json.dumps(data))

def parseAuth():
    '''
    reads the contents of the authlog and looks for:
    ssh login attempts
    '''
    sshList = []

    with open("/var/log/auth.log") as file:
        # goes through each line of the auth file and checks for failed ssh attempts
        for line in file:
            if (re.compile(r".*sshd.*Failed.*").search(line)):
                # 
                tokens = line.strip().split(' ')
                date = line[:15]
                
                # checks if user is invalid, the format is different in the logs
                if (tokens[8] == "invalid"):
                    attempt = (date, tokens[10], tokens[12], tokens[14])
                else:
                    attempt = (date, tokens[8], tokens[10], tokens[12])

                sshList.append(attempt)

        # returns the lists of data
        return [sshList]

def sshStats(sshList):
    '''
    finds the frequency that a username or ip is in a failed password attempt
    '''
    ipDict = {}
    nameDict = {}

    # Add 1 to dictionary value for each ip or name
    for entry in sshList:
        try:
            nameDict[entry[1]] +=1
            ipDict[entry[2]] +=1
        except:
            nameDict[entry[1]] = 1
            ipDict[entry[2]] = 1

    output = {"ip":ipDict, "user":nameDict}
    return output

def actionUptime():
    '''
    retrieves the system uptime and restart information
    '''
    with open("/proc/uptime") as file:
        uptimeMinutes = float(file.readline().split(" ")[0])/60
        uptime = str(int(uptimeMinutes/3600)).rjust(2, '0') + ":" + str(int(uptimeMinutes/60)%24).rjust(2, '0') \
            + ":" + str(int(uptimeMinutes%60)).rjust(2, '0')
    
    return uptime


def main():
    while(1):
        time.sleep(1)
        agentUpdate()


if __name__ == "__main__":
    main()
