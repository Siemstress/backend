#!/bin/sh

if [ "$EUID" -ne 0 ]; then
  echo "This command is requires to be ran as root/superuser"
  exit
fi

echo "+======================+"
echo "  SIEMSTRESS INSTALLER"
echo "+======================+"

echo "Registering Agent..."
curl -X POST "%%HOSTNAME%%/api/agentRegister/%%AGENTID%%/%%AGENT_KEY%%" -H "Content-Type: application/json" \
    -d "{\"hostname\": \"$(hostname)\", \"operatingSystem\": \"$(cat /etc/issue.net)\", \"kernel\": \"$(uname -a)\"}" &> /dev/null;

echo "Installing Agent..."
echo "[Unit]" > /etc/systemd/system/siemstress-agent.service
echo " Description=Siemstress Agent" >> /etc/systemd/system/siemstress-agent.service
echo " ConditionPathExists=/etc/siemstress-agent.py" >> /etc/systemd/system/siemstress-agent.service
echo " StartLimitIntervalSec=10" >> /etc/systemd/system/siemstress-agent.service
echo " StartLimitBurst=60" >> /etc/systemd/system/siemstress-agent.service
echo "" >> /etc/systemd/system/siemstress-agent.service
echo "[Service]" >> /etc/systemd/system/siemstress-agent.service
echo " Type=forking" >> /etc/systemd/system/siemstress-agent.service
echo " ExecStart=/etc/siemstress-agent.py" >> /etc/systemd/system/siemstress-agent.service
echo " TimeoutSec=0" >> /etc/systemd/system/siemstress-agent.service
echo " Restart=on-failure" >> /etc/systemd/system/siemstress-agent.service
echo " StandardOutput=tty" >> /etc/systemd/system/siemstress-agent.service
echo " RemainAfterExit=yes" >> /etc/systemd/system/siemstress-agent.service
echo " SysVStartPriority=99" >> /etc/systemd/system/siemstress-agent.service
echo "" >> /etc/systemd/system/siemstress-agent.service
echo "[Install]" >> /etc/systemd/system/siemstress-agent.service
echo " WantedBy=multi-user.target" >> /etc/systemd/system/siemstress-agent.service

curl %%HOSTNAME%%/api/agentPython/%%AGENTID%%/%%AGENT_KEY%% -o /etc/siemstress-agent.py &> /dev/null;
chmod 500 /etc/siemstress-agent.py;

systemctl enable siemstress-agent
systemctl start siemstress-agent &
echo "Agent Install Completed"
