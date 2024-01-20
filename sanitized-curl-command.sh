## This is the cURL command that the browser extension will need to emulate to get the content of unread emails:

curl 'https://mail.google.com/sync/u/0/i/fd?hl=en&c=0&rt=r&pt=ji' --compressed -X POST \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0' \
-H 'Accept: */*' \
-H 'Accept-Language: en-US,en;q=0.5' \
-H 'Accept-Encoding: gzip, deflate, br' \
-H 'X-Google-BTD: 1' \
-H 'X-Gmail-BTAI: [sanitized]' \
-H 'X-Gmail-Storage-Request: ' \
-H 'X-Framework-Xsrf-Token: [sanitized]' \
-H 'Content-Type: application/json' \
-H 'Origin: https://mail.google.com' \
-H 'Connection: keep-alive' \
-H 'Referer: https://mail.google.com/mail/u/0/' \
--data-raw '[sanitized]'


## The data-raw format is [[["thread-f:12345678912312312",1,null,null,1]],1]. This is (likely) the field where the POST call gets parameterized by the email identifier.


## Note: This is as of 01/19/2024, keeping consistent with the API changes is likely going to be the hardest piece of keeping this operational.