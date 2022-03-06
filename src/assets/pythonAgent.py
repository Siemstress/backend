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
from urllib.parse import urlencode
from urllib.request import Request, urlopen


URL = "https://siemless.tech"

def post(command, data):
    '''
    sends information to server
    if action is within the response, e.g. report is called, the requested information is sent

    commands:
    agentUpdate {id: number, agentToken: string, cpu: number, memory: number, netIn: number, netOut: number, disk: number}
    actionSss
    '''
    # print(str(data))
    dataEncoded = urlencode(data)
    dataEncoded = dataEncoded.encode('ascii')
    response = urlopen('%%HOSTNAME%%' + "/api/" + command + "/" + '%%AGENTID%%'+ "/" + '%%AGENT_KEY%%', dataEncoded)
    body = response.read()
    # print(body)

    if (json.loads(body)["action"] == "ssh"):
        data = sshStats(parseAuth()[0])
        post('agentActionSsh', data)


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

    post('agentUpdate', data)

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
                # grabs the datetime from the line
                # date = re.compile(r"... \d\d \d\d:\d\d:\d\d").findall(line)[0]
                date = ""

                # grabs the user from the line
                user = re.compile(r"for \S*").findall(line)[0][4:]

                # checks if the user is invalid, different message format
                if (user.lower() == "invalid"):
                    user = re.compile(r"user \S*").findall(line)[0][5:]

                # grabs the user from the line
                ip = re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}").findall(line)[0]

                # grabs the user from the line
                port = re.compile(r"port \S*").findall(line)[0][5:]
                

                sshList.append((date, user, ip, port))

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
        except:
            nameDict[entry[1]] = 1

        try:
            ipDict[entry[2]] +=1
        except:
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
        try:
            agentUpdate()
        except:
            pass

if __name__ == "__main__":
    main()
