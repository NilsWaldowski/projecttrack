/* Imports for global scope */

Router = Package['iron:router'].Router;
RouteController = Package['iron:router'].RouteController;
moment = Package['mrt:moment'].moment;
Meteor = Package.meteor.Meteor;
WebApp = Package.webapp.WebApp;
main = Package.webapp.main;
WebAppInternals = Package.webapp.WebAppInternals;
Log = Package.logging.Log;
Tracker = Package.deps.Tracker;
Deps = Package.deps.Deps;
DDP = Package.livedata.DDP;
DDPServer = Package.livedata.DDPServer;
MongoInternals = Package.mongo.MongoInternals;
Mongo = Package.mongo.Mongo;
Blaze = Package.ui.Blaze;
UI = Package.ui.UI;
Handlebars = Package.ui.Handlebars;
Spacebars = Package.spacebars.Spacebars;
check = Package.check.check;
Match = Package.check.Match;
_ = Package.underscore._;
Random = Package.random.Random;
EJSON = Package.ejson.EJSON;
Iron = Package['iron:core'].Iron;
EditableText = Package['babrahams:editable-text'].EditableText;
SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
MongoObject = Package['aldeed:simple-schema'].MongoObject;
HTML = Package.htmljs.HTML;
sanitizeHtml = Package['djedi:sanitize-html'].sanitizeHtml;

