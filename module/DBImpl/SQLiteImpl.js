/**
 * Created by syuchan on 2017/05/03.
 */
import DBConnector from "./../DBConnector";
import sqlite from "sqlite-sync";
import Util from "./../Util";

class SQLiteImpl {
    constructor(config) {
        this.config = config;
        this.db = sqlite;
        sqlite.connect(this.config.database);
    }

    createTable() {
        const db = this.db;
        db.run(`CREATE TABLE IF NOT EXISTS users (
                  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                  name TEXT UNIQUE,
                  password TEXT,
                  role TEXT
                )`);
        db.run(`CREATE TABLE IF NOT EXISTS songs (
                  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                  title TEXT,
                  artist TEXT,
                  length INT,
                  album INT,
                  track INT,
                  source_path TEXT UNIQUE,
                  path TEXT,
                  perm TEXT DEFAULT '["*"]',
                  UNIQUE (title, album)
                )`);
        db.run(`CREATE TABLE IF NOT EXISTS albums (
                  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  artist TEXT,
                  genre TEXT,
                  track_number INT,
                  thumbnail TEXT,
                  UNIQUE (name, artist)
                )`);
        db.run(`CREATE TABLE IF NOT EXISTS themes (
                  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                  folder TEXT NOT NULL,
                  name TEXT NOT NULL UNIQUE,
                  description TEXT,
                  version TEXT
                )`);
        db.run(`CREATE TABLE IF NOT EXISTS settings (
                  version_id TEXT NOT NULL UNIQUE,
                  music_path TEXT NOT NULL,
                  cnv_src TEXT NOT NULL,
                  default_theme TEXT NOT NULL
                )`);
        db.run(`INSERT INTO settings SELECT '${this.config.version}', music_path, cnv_src, default_theme FROM settings ORDER BY version_id DESC LIMIT 1`);
        db.run(`INSERT INTO settings VALUES ('${this.config.version}', '/music', 'OGG,AAC,FLAC,WMA,OTHER', 'DEFAULT')`);
    }

    getSetting() {
        return this.db.run(`SELECT * FROM settings WHERE version_id = '${this.config.version}'`)[0];
    }

    updateSetting(music_path, src, theme) {
        this.db.run(`UPDATE settings SET music_path='${music_path}', cnv_src='${src}', default_theme='${theme}' WHERE version_id='${this.config.version}'`);
    }

    getAlbums() {
        return this.db.run("SELECT * FROM albums");
    }

    getArtistAlbums(artist) {
        artist = DBConnector.singleQuoteEscape(artist);
        return this.db.run(`SELECT * FROM albums WHERE artist='${artist}'`);
    }

    getGenreAlbums(genre) {
        genre = DBConnector.singleQuoteEscape(genre);
        return this.db.run(`SELECT * FROM albums WHERE genre='${genre}'`);
    }

    getAlbum(id) {
        id = DBConnector.singleQuoteEscape(id);
        const album = this.db.run(`SELECT * FROM albums WHERE id='${id}'`);
        if (album.length === 0) {
            return undefined;
        } else {
            return album[0];
        }
    }

    addAlbum(album_name, artist, genre, track_number) {
        album_name = DBConnector.singleQuoteEscape(album_name);
        artist = DBConnector.singleQuoteEscape(artist);
        genre = DBConnector.singleQuoteEscape(genre);
        track_number = DBConnector.singleQuoteEscape(track_number);
        this.db.run(`INSERT INTO albums VALUES(NULL, '${album_name}', '${artist}', '${genre}', ${track_number}, NULL)`);
        return {
            id: this.db.run(`SELECT id FROM albums WHERE name='${album_name}' AND artist='${artist}'`)[0]['id'],
        }
    }

    setAlbumThumbnail(albumId, thumbnail) {
        albumId = DBConnector.singleQuoteEscape(albumId);
        thumbnail = DBConnector.singleQuoteEscape(thumbnail);
        this.db.run(`UPDATE albums SET thumbnail='${thumbnail}' WHERE id='${albumId}'`)
    }

    getThemes() {
        return this.db.run(`SELECT * FROM themes`);
    }

    getThemeFolder(name) {
        name = DBConnector.singleQuoteEscape(name);
        const rows = this.db.run(`SELECT folder FROM themes WHERE name='${name}'`);
        if (rows.length === 0) {
            return "default";
        } else {
            return rows[0].folder;
        }
    }

    addTheme(folder, name, description, version) {
        folder = DBConnector.singleQuoteEscape(folder);
        name = DBConnector.singleQuoteEscape(name);
        description = DBConnector.singleQuoteEscape(description);
        version = DBConnector.singleQuoteEscape(version);
        this.db.run(`INSERT INTO themes VALUES(NULL, '${folder}', '${name}', '${description}', '${version}')`);
    }

    getSongs() {
        return this.db.run("SELECT * FROM songs");
    }

    getAlbumSongs(id) {
        id = DBConnector.singleQuoteEscape(id);
        return this.db.run(`SELECT * FROM songs WHERE album='${id}' ORDER BY track, title`);
    }

    getArtistSongs(artist) {
        artist = DBConnector.singleQuoteEscape(artist);
        return this.db.run(`SELECT * FROM songs WHERE artist='${artist}'`);
    }

    getSong(id) {
        id = DBConnector.singleQuoteEscape(id);
        const rows = this.db.run(`SELECT * FROM songs WHERE id='${id}'`);
        if (rows.length !== 1) {
            return undefined;
        } else {
            return rows[0];
        }
    }

    getSongAndThumbnail(id) {
        id = DBConnector.singleQuoteEscape(id);
        const rows = this.db.run(`SELECT
          songs.id         AS id,
          songs.title      AS title,
          songs.artist     AS artist,
          songs.length     AS length,
          songs.album      AS album,
          songs.track      AS track,
          songs.path       AS path,
          songs.perm       AS perm,
          albums.thumbnail AS thumbnail
        FROM songs JOIN albums ON songs.album = albums.id WHERE songs.id = '${id}'`);
        if (rows.length !== 1) {
            return undefined;
        } else {
            return rows[0];
        }
    }

    getFullSongs() {
        return this.db.run(`SELECT songs.id as song_id,albums.id as album_id,title,length,songs.artist as artist,name,genre,perm FROM songs INNER JOIN albums ON songs.album = albums.id`);
    }

    addSong(title, album_id, track, artist, length, source_path, path) {
        this.db.insert("songs", {
            title: DBConnector.singleQuoteEscape(title),
            artist: DBConnector.singleQuoteEscape(artist),
            album: DBConnector.singleQuoteEscape(album_id),
            track: DBConnector.singleQuoteEscape(track),
            length: DBConnector.singleQuoteEscape(length),
            source_path: DBConnector.singleQuoteEscape(source_path),
            path: DBConnector.singleQuoteEscape(path)
        });
    }

    getUserId(username, hash) {
        username = DBConnector.singleQuoteEscape(username);
        hash = DBConnector.singleQuoteEscape(hash);
        const rows = this.db.run(`SELECT id FROM users WHERE name='${username}' AND password='${hash}'`);
        if (rows.length !== 1) {
            return undefined;
        } else {
            return rows[0]['id'];
        }
    }

    getUsers() {
        const rows = this.db.run("SELECT * FROM users");
        if (rows.length < 1) {
            return undefined;
        } else {
            return rows;
        }
    }

    getUser(id) {
        id = DBConnector.singleQuoteEscape(id);
        const rows = this.db.run(`SELECT * FROM users WHERE id='${id}'`);
        if (rows.length !== 1) {
            return undefined;
        } else {
            return rows[0];
        }
    }

    getArtists(role) {
        if (!role) role = "*";
        if (role === "admin") {
            return this.db.run(`SELECT DISTINCT artist FROM songs`);
        } else {
            return this.db.run(`SELECT DISTINCT artist FROM songs WHERE perm LIKE '%"${role}"%' OR perm LIKE '%"*"%'`);
        }
    }

    getGenres(role) {
        if (!role) role = "*";
        if (role === "admin") {
            return this.db.run(`SELECT DISTINCT genre FROM albums`);
        } else {
            return this.db.run(`SELECT DISTINCT genre FROM albums WHERE id IN (SELECT DISTINCT album FROM songs WHERE perm LIKE '%"${role}"%' OR perm LIKE '%"*"%')`);
        }
    }

    addUserPassword(username, password, role) {
        username = DBConnector.singleQuoteEscape(username);
        password = DBConnector.singleQuoteEscape(password);
        role = DBConnector.singleQuoteEscape(role);
        this.addUser(username, Util.createStorePassword(username, password), role);
    }

    addUser(username, hash, role) {
        this.db.insert("users", {
            name: DBConnector.singleQuoteEscape(username),
            password: DBConnector.singleQuoteEscape(hash),
            role: DBConnector.singleQuoteEscape(role)
        });
    }

    existAdmin() {
        return this.db.run(`SELECT COUNT(role) FROM users WHERE role='admin'`)[0]['COUNT(role)'] >= 1;
    }

    changeRole(userId, username, role) {
        userId = DBConnector.singleQuoteEscape(userId);
        username = DBConnector.singleQuoteEscape(username);
        role = DBConnector.singleQuoteEscape(role);
        this.db.run(`UPDATE users SET role='${role}' WHERE id='${userId}' AND name='${username}'`);
    }

    changePerm(songId, perm, beforePerm) {
        this.db.run(`UPDATE songs SET perm='${perm}' WHERE id='${songId}' AND perm='${beforePerm}'`);
    }

    deleteUser(userId, username, role) {
        userId = DBConnector.singleQuoteEscape(userId);
        username = DBConnector.singleQuoteEscape(username);
        role = DBConnector.singleQuoteEscape(role);
        this.db.run(`DELETE FROM users WHERE id='${userId}' AND name='${username}' AND role='${role}'`);
    }

    resetThemes() {
        this.db.run(`DROP TABLE themes`);
        this.createTable();
    }

    resetDB() {
        this.db.run("DROP TABLE albums");
        this.db.run("DROP TABLE songs");
        this.createTable();
    }
}

export default SQLiteImpl;