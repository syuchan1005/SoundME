/**
 * Created by syuchan on 2017/03/16.
 */
import User from "./User";
import sqlite from "sqlite-sync";

class DBConnector {
    constructor(config) {
        this.config = config;
        switch (config.type) {
            case "sqlite":
                this.db = sqlite;
                sqlite.connect(config.database);
                break;
            default:
                throw new Error("Unknown SQLType :" + config.type);
        }
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
                  UNIQUE (title, album)
                )`);
        db.run(`CREATE TABLE IF NOT EXISTS albums (
                  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  artist TEXT,
                  genre TEXT,
                  track_number INT,
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
        db.run(`INSERT INTO settings VALUES ('${this.config.version}', '/music', 'OGG,AAC,FLAC,WMA,OTHER', 'DEFAULT')`);
    }

    getConfig() {
        return this.config;
    }

    getDB() {
        return this.db;
    }

    getSetting() {
        return this.db.run("SELECT * FROM settings")[0];
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
        this.db.run(`INSERT INTO albums VALUES(NULL, '${album_name}', '${artist}', '${genre}', ${track_number})`);
        return this.db.run(`SELECT id FROM albums WHERE name='${album_name}' AND artist='${artist}'`)[0]['id'];
    }

    getThemes() {
        return this.db.run(`SELECT * FROM themes`);
    }

    getThemeFolder(name) {
        name = DBConnector.singleQuoteEscape(name);
        const rows = this.db.run(`SELECT folder FROM themes WHERE name='${name}'`);
        if (rows.length === 0) {
            return undefined;
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

    getFullSongs() {
        return this.db.run(`SELECT songs.id as song_id,albums.id as album_id,title,length,songs.artist as artist,name,genre FROM songs INNER JOIN albums ON songs.album = albums.id`);
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

    getArtists() {
        return this.db.run("SELECT DISTINCT artist FROM albums UNION SELECT artist FROM songs ORDER BY artist");
    }

    getGenres() {
        return this.db.run(`SELECT DISTINCT genre FROM albums`);
    }

    addUserPassword(username, password, role) {
        username = DBConnector.singleQuoteEscape(username);
        password = DBConnector.singleQuoteEscape(password);
        role = DBConnector.singleQuoteEscape(role);
        this.addUser(username, User.createStorePassword(username, password), role);
    }

    addUser(username, hash, role) {
        this.db.insert("users", {
            name: DBConnector.singleQuoteEscape(username),
            password: DBConnector.singleQuoteEscape(hash),
            role: DBConnector.singleQuoteEscape(role)
        });
    }

    changeRole(userId, username, role) {
        userId = DBConnector.singleQuoteEscape(userId);
        username = DBConnector.singleQuoteEscape(username);
        role = DBConnector.singleQuoteEscape(role);
        this.db.run(`UPDATE users SET role='${role}' WHERE id='${userId}' AND name='${username}'`);
    }

    deleteUser(userId, username, role) {
        userId = DBConnector.singleQuoteEscape(userId);
        username = DBConnector.singleQuoteEscape(username);
        role = DBConnector.singleQuoteEscape(role);
        this.db.run(`DELETE FROM users WHERE id='${userId}' AND name='${username}' AND role='${role}'`);
    }

    resetDB() {
        this.db.run("DROP TABLE albums");
        this.db.run("DROP TABLE songs");
        this.createTable();
    }

    static singleQuoteEscape(data) {
        const str = data + "";
        return str.replace(/[\0\n\r\b\t\\'"\x1a]/g, function (s) {
            switch (s) {
                case "\0":
                    return "\\0";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\b":
                    return "\\b";
                case "\t":
                    return "\\t";
                case "\x1a":
                    return "\\Z";
                case "'":
                    return "''";
                case '"':
                    return '""';
                default:
                    return "\\" + s;
            }
        });
    }
}

export default DBConnector;