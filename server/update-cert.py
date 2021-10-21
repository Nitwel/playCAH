import re

linkFile = open("/var/www/vhosts/system/playcah.de/conf/last_nginx.conf")
linkText = linkFile.read()

regex = r"ssl_certificate.*?(/usr/local/psa/var/certificates/.*?);$"
keyFilePath = re.findall(regex, linkText, re.MULTILINE)[0]

keyFile = open(keyFilePath)
keyText = keyFile.read()

privateKeyRegex = r"(-----BEGIN PRIVATE KEY-----(.|\s)*?-----END PRIVATE KEY-----)"
privateKey = re.findall(privateKeyRegex, keyText)[0][0]
privateCertRegex = r"(-----BEGIN CERTIFICATE-----(.|\s)*?-----END CERTIFICATE-----)"
certificate = re.findall(privateCertRegex, keyText)[0][0]

pkFileOut = open("private.key", "w")
pkFileOut.seek(0)
pkFileOut.write(privateKey)
pkFileOut.truncate()
pkFileOut.close()
certFileOut = open("cert.crt", "w")
certFileOut.seek(0)
certFileOut.write(certificate)
certFileOut.truncate()
certFileOut.close()