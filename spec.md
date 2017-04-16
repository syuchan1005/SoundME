# MEMO
test.db.bakにはusersに["user","pass"]のユーザーが入っている

# DB
```text
CREATE DATABASE IF NOT EXISTS SoundME;
USE SoundME;
```


## ユーザー (users)

| カラム   | データ          | いろいろ       |
|----------|-----------------|----------------|
| id       | 1               | auto_increment |
| name     | syuchan         | 生データ       |
| password | $2a$6d$5a$...   | SHA-256        |
| role     | admin, listener | Text           |

```text
CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    password TEXT,
    role TEXT
)
```

## 曲 (songs)

| カラム      | データ          | いろいろ                                          |
|-------------|-----------------|---------------------------------------------------|
| id          | 1               | auto_increment                                    |
| title       | Test            | 曲名                                              |
| artist      | syuchan         | アーティスト名                                    |
| length      | 41000           | 曲の長さ                                          | 
| album       | 1               | albums->id                                        |
| track       | 1               | トラック番号                                      |
| source_path | /music/****.aac | 元のファイルパス                                  |
| path        | /cache/***.mp3  | ogg mp3 flac wav webmの場合そのまま上をコピーする |
| created     | 2017/3/16 13:49 | 時間                                              |

```text
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  artist TEXT,
  length INT,
  album INT,
  track INT,
  source_path TEXT UNIQUE,
  path TEXT,
  UNIQUE (title, album)
)
```

## アルバム (albums)

| カラム       | データ  | いろいろ       |
|--------------|---------|----------------|
| id           | 1       | auto_increment |
| name         | Karaoke | アルバム名     |
| artist       | syuchan | アーティスト名 |
| genre        | J-POP   | ジャンル       |
| track_number | 10      | 合計曲数       |

```text
CREATE TABLE IF NOT EXISTS albums (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  artist TEXT,
  genre TEXT,
  track_number INT,
  UNIQUE (name, artist)
)
```

## 設定 (settings)

| カラム        | データ           | いろいろ           |
|---------------|------------------|--------------------|
| version_id    | 0.0.1            | SoundMeのバージョン|
| music_path    | /static/music    | フォルダ           |
| cnv_src       | OGG,AAC,FLAC,WMA | 変換対象の拡張子   |
| default_theme | DEFAULT          | 標準のテーマ       |

```text
CREATE TABLE IF NOT EXISTS settings (
  version_id TEXT NOT NULL UNIQUE,
  music_path TEXT NOT NULL,
  cnv_src TEXT NOT NULL,
  default_theme TEXT NOT NULL
)
INSERT INTO settings VALUES ('0.0.1', '/static/music', 'OGG,AAC,FLAC,WMA', 'DEFAULT')
```

# Routing
 - 省略

# SQL
## updateSetting
```text
UPDATE settings SET music_path='${music_path}', cnv_src='${src}', default_theme='${theme}' WHERE version_id='${version}'
```

## getAlbums
```text
SELECT * FROM albums
```
## getArtistAlbums
```text
SELECT * FROM albums WHERE artist='${artist}'
```
## getGenreAlbums
```text
SELECT * FROM albums WHERE genre='${genre}'
```
## getAlbum
```text
SELECT * FROM albums WHERE id='${id}'
```
## addAlbum
```text
INSERT INTO albums VALUES(NULL, '${album_name}', '${artist}', '${genre}', ${track_number})

SELECT id FROM albums WHERE name='${album_name}' AND artist='${artist}'
```

## getSongs
```text
SELECT * FROM songs
```
## getAlbumSongs
```text
SELECT * FROM songs WHERE album='${id}' ORDER BY track, title
```
## getArtistSongs
```text
SELECT * FROM songs WHERE artist='${artist}'
```
## getSong
```text
SELECT * FROM songs WHERE id='${id}'
```
## getFullSongs
```text
SELECT songs.id as song_id,albums.id as album_id,title,length,songs.artist as artist,name,genre FROM songs INNER JOIN albums ON songs.album = albums.id
```
## addSong
```text
INSERT INTO songs VALUES(NULL, $title, $artist, $album, $track, $length, $source_path, $path)
```
## getUserId
```text
SELECT id FROM users WHERE name='${username}' AND password='${hash}'
```

## getUser
```text
SELECT * FROM users
```

## getUser
```text
SELECT * FROM users WHERE id='${id}'
```

## getArtists
```text
SELECT DISTINCT artist FROM albums UNION SELECT artist FROM songs ORDER BY artist
```

## getGenres
```text
SELECT DISTINCT genre FROM albums
```

## addUser
```text
INSERT INTO users VALUES(NULL, $name, $hash, $role)
```

## changeRole
```text
UPDATE users SET role='${role}' WHERE id='${userId}' AND name='${username}'
```

## deleteUser
```text
DELETE FROM users WHERE id='${userId}' AND name='${username}' AND role='${role}'
```

## resetDB
```text
DROP TABLE albums
DROP TABLE songs
```