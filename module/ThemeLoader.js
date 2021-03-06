/**
 * Created by syuchan on 2017/04/17.
 */
import fs from "fs";
import Path from "path";

import sass from "node-sass";

class ThemeLoader {
    constructor(connector) {
        this.connector = connector;
    }

    loadAllThemes() {
        const connector = this.connector;
        const themeFolder = Path.join(__dirname, "../theme");
        fs.readdir(themeFolder, async function (err, folders) {
            folders.forEach(function (folder_name) {
                const folder = Path.join(themeFolder, folder_name);
                if (fs.statSync(folder).isDirectory()) {
                    const json = JSON.parse(fs.readFileSync(Path.join(folder, "theme.json")));
                    const saveCSS = Path.join(folder, `main.css`);
                    sass.render({
                        file: Path.join(folder, "main.scss"),
                        outFile: saveCSS,
                        outputStyle: "compressed",
                        sourceMap: true
                    }, function (err, result) {
                        fs.writeFileSync(saveCSS, result.css);
                        fs.writeFileSync(`${saveCSS}.map`, result.map);
                        connector.addTheme(folder_name, json.name, json.description, json.version);
                    });
                }
            });
        });
    }
}

export default ThemeLoader;