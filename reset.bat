@echo off
del test.db
del static\cache\*.mp3
del static\thumbnail\*.png
copy test.db.bak test.db