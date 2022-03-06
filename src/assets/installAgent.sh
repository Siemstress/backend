#!/bin/sh

if [ "$EUID" -ne 0 ] then
  echo "This command is requires to be ran as root/superuser"
  exit
fi

echo "SIEMSTRESS INSTALLER"

echo "Registering Agent..."
curl -X POST "%%HOSTNAME%%/api/agentRegister/%%AGENTID%%/%%AGENT_KEY%%" -H "Content-Type: application/json" \
    -d "{\"hostname\": \"$(hostname)\", \"operatingSystem\": \"$(cat /etc/issue.net)\", \"kernel\": \"$(uname -a)\"}"

echo "Installing Agent..."
echo "[Unit]" > /etc/systemd/system/siemstress-agent.service
echo " Description=/etc/rc.local Compatibility" >> /etc/systemd/system/siemstress-agent.service
echo " ConditionPathExists=/etc/rc.local" >> /etc/systemd/system/siemstress-agent.service
echo "" >> /etc/systemd/system/siemstress-agent.service
echo "[Service]" >> /etc/systemd/system/siemstress-agent.service
echo " Type=forking" >> /etc/systemd/system/siemstress-agent.service
echo " ExecStart=/etc/siemstress-agent.py" >> /etc/systemd/system/siemstress-agent.service
echo " TimeoutSec=0" >> /etc/systemd/system/siemstress-agent.service
echo " StandardOutput=tty" >> /etc/systemd/system/siemstress-agent.service
echo " RemainAfterExit=yes" >> /etc/systemd/system/siemstress-agent.service
echo " SysVStartPriority=99" >> /etc/systemd/system/siemstress-agent.service
echo "" >> /etc/systemd/system/siemstress-agent.service
echo "[Install]" >> /etc/systemd/system/siemstress-agent.service
echo " WantedBy=multi-user.target" >> /etc/systemd/system/siemstress-agent.service

curl %%HOSTNAME%%/api/agentPython/%%AGENTID%%/%%AGENT_KEY%% -o /etc/siemstress-agent.py;
chmod 500 /etc/siemstress-agent.py;

systemctl enable --now siemstress-agent
systemctl start siemstress-agent
echo "Agent Install Completed"
