const fs = require("fs");
const path = require("path");

const getEvents = (base, next) => {
  const compare = (a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  };

  fs.readdir(base, (err, files) => {
    if (err) throw err;

    const events = files
      .filter((v) => path.extname(v) === ".json")
      .map((f) => {
        const parsed = JSON.parse(fs.readFileSync(path.join(base, f), "utf-8"));
        return { date: new Date(parsed.start), data: parsed, path: f };
      })
      .sort(compare)
      .map((v) => ({
        path: path.basename(v.path, ".json"),
        start: v.data.start,
        end: v.data.end,
      }));

    next(events);
  });
};

class EventListPlugin {
  static defaultOptions = { outputFile: "events.json", baseDir: "public/data" };

  constructor(options = {}) {
    this.options = { ...EventListPlugin.defaultOptions, ...options };
  }

  apply(compiler) {
    const pluginName = EventListPlugin.name;
    const { webpack } = compiler;
    const { RawSource } = webpack.sources;

    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      getEvents(this.options.baseDir, (events) => {
        compilation.emitAsset(
          this.options.outputFile,
          new RawSource(JSON.stringify(events))
        );
        callback();
      });
    });
  }
}

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: { path: false, fs: false, crypto: false },
      },
      plugins: [new EventListPlugin({ outputFile: "events.json" })],
    },
  },
};
