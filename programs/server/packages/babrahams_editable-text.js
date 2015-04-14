(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var sanitizeHtml = Package['djedi:sanitize-html'].sanitizeHtml;

/* Package-scope variables */
var EditableText, sanitizeHtml, newValue;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/babrahams:editable-text/lib/editable_text_common.js                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
if (typeof EditableText === 'undefined') {                                                                           // 1
  EditableText = {};                                                                                                 // 2
}                                                                                                                    // 3
                                                                                                                     // 4
                                                                                                                     // 5
// ******************************************                                                                        // 6
// CONFIG that affects BOTH CLIENT AND SERVER                                                                        // 7
// ******************************************                                                                        // 8
                                                                                                                     // 9
EditableText.userCanEdit = function(doc,Collection) {                                                                // 10
  // e.g. return this.user_id = Meteor.userId();                                                                     // 11
  return true;                                                                                                       // 12
}                                                                                                                    // 13
                                                                                                                     // 14
EditableText.useTransactions = (typeof tx !== 'undefined' && _.isObject(tx.Transactions)) ? true : false;            // 15
EditableText.clientControlsTransactions = false;                                                                     // 16
                                                                                                                     // 17
EditableText.maximumImageSize = 0; // Can't put image data in the editor by default                                  // 18
                                                                                                                     // 19
// This is the set of defaults for sanitizeHtml on the server (as set by the library itself)                         // 20
// Required on the client for consistency of filtering on the paste event                                            // 21
if (Meteor.isClient) {                                                                                               // 22
  sanitizeHtml = {};                                                                                                 // 23
  sanitizeHtml.defaults = {                                                                                          // 24
    allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre' ],
    allowedAttributes: { a: [ 'href', 'name', 'target' ] },                                                          // 26
    selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],                         // 27
    allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ]                                                             // 28
  };                                                                                                                 // 29
}                                                                                                                    // 30
                                                                                                                     // 31
EditableText.allowedHtml = {                                                                                         // 32
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['sub','sup','font','i']),                                   // 33
  allowedAttributes: _.extend(sanitizeHtml.defaults.allowedAttributes,{font:['size','face'],div:['align','style'],td:['rowspan','colspan','style'],a:['href','target','class'],i:['class']}),
  allowedSchemes:['http','https','ftp','mailto']                                                                     // 35
};                                                                                                                   // 36
                                                                                                                     // 37
                                                                                                                     // 38
// ******************************************                                                                        // 39
// Functions that are intended for use in app                                                                        // 40
// ******************************************                                                                        // 41
                                                                                                                     // 42
// Function for setting multiple config variable via a hash                                                          // 43
                                                                                                                     // 44
EditableText.config = function(config) {                                                                             // 45
  if (_.isObject(config)) {                                                                                          // 46
     _.each(config,function(val,key) {                                                                               // 47
       if (_.contains(['userCanEdit','insert','update','remove'],key)) {                                             // 48
         if (_.isFunction(val)) {                                                                                    // 49
           EditableText[key] = val;                                                                                  // 50
         }                                                                                                           // 51
         else {                                                                                                      // 52
           throw new Meteor.Error(key + ' must be a function');                                                      // 53
         }                                                                                                           // 54
       }                                                                                                             // 55
       if (_.contains(['useTransactions','clientControlsTransactions','saveOnFocusout','trustHtml','useMethods'],key)) {
         if (_.isBoolean(val)) {                                                                                     // 57
           EditableText[key] = val;                                                                                  // 58
         }                                                                                                           // 59
         else {                                                                                                      // 60
           throw new Meteor.Error(key + ' must be a boolean');                                                       // 61
         }                                                                                                           // 62
       }                                                                                                             // 63
       if (_.contains(['collection2Options'], key)) {                                                                // 64
         if (_.isObject(val)) {                                                                                      // 65
            EditableText[key] = val;                                                                                 // 66
         }                                                                                                           // 67
       }                                                                                                             // 68
     });                                                                                                             // 69
  }                                                                                                                  // 70
  else {                                                                                                             // 71
    throw new Meteor.Error('Editable text config object must be a hash of key value pairs. Config not changed.');    // 72
  }                                                                                                                  // 73
}                                                                                                                    // 74
                                                                                                                     // 75
// Function for registering callbacks                                                                                // 76
                                                                                                                     // 77
EditableText.registerCallbacks = function(obj) {                                                                     // 78
  if (_.isObject(obj)) {                                                                                             // 79
    _.each(obj,function(val,key) {                                                                                   // 80
      if (_.isFunction(val)) {                                                                                       // 81
        EditableText._callbacks[key] = val;                                                                          // 82
      }                                                                                                              // 83
      else {                                                                                                         // 84
        throw new Meteor.Error('Callbacks need to be functions. You passed a ' + typeof(val) + '.');                 // 85
      }                                                                                                              // 86
    });                                                                                                              // 87
  }                                                                                                                  // 88
  else {                                                                                                             // 89
    throw new Meteor.Error('You must pass an object to register callbacks');                                         // 90
  }                                                                                                                  // 91
}                                                                                                                    // 92
                                                                                                                     // 93
                                                                                                                     // 94
// *********************************                                                                                 // 95
// INTERNAL PROPERTIES AND FUNCTIONS                                                                                 // 96
// *********************************                                                                                 // 97
                                                                                                                     // 98
EditableText._callbacks = {};                                                                                        // 99
                                                                                                                     // 100
EditableText._callback = function(callback,doc) {                                                                    // 101
  callback = String(callback);                                                                                       // 102
  var self = this;                                                                                                   // 103
  if (self[callback] && _.isString(self[callback])) {                                                                // 104
    var mutatedDoc = EditableText._executeCallback(self[callback],self,doc);                                         // 105
    doc = _.isObject(mutatedDoc) && mutatedDoc || doc;                                                               // 106
  }                                                                                                                  // 107
  return doc;                                                                                                        // 108
}                                                                                                                    // 109
                                                                                                                     // 110
EditableText._executeCallback = function(callbackFunctionName,self,doc) {                                            // 111
  var mutatedDoc = doc;                                                                                              // 112
  var callbackFunction = EditableText._callbacks[callbackFunctionName];                                              // 113
  if (callbackFunction && _.isFunction(callbackFunction)) {                                                          // 114
    mutatedDoc = callbackFunction.call(self,doc,Mongo.Collection.get(self.collection)) || mutatedDoc;                // 115
  }                                                                                                                  // 116
  else {                                                                                                             // 117
    throw new Meteor.Error('Could not execute callback. Reason: ' + ((callbackFunction) ? '"' + callbackFunctionName + '" is not a function, it\'s a ' + typeof(callbackFunction) + '.' : 'no callback function called "' + callbackFunctionName + '" has been registered via EditableText.registerCallbacks.'));    
  }                                                                                                                  // 119
  return mutatedDoc;                                                                                                 // 120
}                                                                                                                    // 121
                                                                                                                     // 122
EditableText._drillDown = function(obj,key) {                                                                        // 123
  return Meteor._get.apply(null,[obj].concat(key.split('.')));                                                       // 124
}                                                                                                                    // 125
                                                                                                                     // 126
EditableText._allowedHtml = function() {                                                                             // 127
  var allowed = EditableText.allowedHtml;                                                                            // 128
  if (EditableText.maximumImageSize && _.isNumber(EditableText.maximumImageSize) && allowed) {                       // 129
    allowed.allowedTags.push('img');                                                                                 // 130
    allowed.allowedAttributes.img = ['src'];                                                                         // 131
    allowed.allowedSchemes.push('data');                                                                             // 132
  }                                                                                                                  // 133
  return allowed;                                                                                                    // 134
}                                                                                                                    // 135
                                                                                                                     // 136
                                                                                                                     // 137
// *************                                                                                                     // 138
// UPDATE METHOD                                                                                                     // 139
// *************                                                                                                     // 140
                                                                                                                     // 141
Meteor.methods({                                                                                                     // 142
  _editableTextWrite : function(action,data,modifier,transaction) {                                                  // 143
    check(action,String);                                                                                            // 144
    check(data,Object);                                                                                              // 145
    check(data.collection,String);                                                                                   // 146
    check(data.context,(typeof FS !== "undefined" && FS.File) ? Match.OneOf(Object, FS.File) : Object);              // 147
    check(modifier,(action === 'update') ? Object : null);                                                           // 148
    check(transaction,Boolean);                                                                                      // 149
    check(data.objectTypeText,Match.OneOf(String,undefined));                                                        // 150
    var hasPackageCollection2 = !!Package['aldeed:collection2'];                                                     // 151
    var hasPackageSimpleSchema = !!Package['aldeed:simple-schema'];                                                  // 152
    var Collection = Mongo.Collection.get(data.collection);                                                          // 153
    var c2optionsHashRequired = hasPackageCollection2 && hasPackageSimpleSchema && !!Collection.simpleSchema();      // 154
    if (Collection && EditableText.userCanEdit.call(data,data.context,Collection)) {                                 // 155
	  if (Meteor.isServer) {                                                                                            // 156
        if (_.isBoolean(EditableText.useTransactions) && !EditableText.clientControlsTransactions) {                 // 157
          transaction = EditableText.useTransactions;                                                                // 158
        }                                                                                                            // 159
      }                                                                                                              // 160
      if (typeof tx === 'undefined') {                                                                               // 161
        transaction = false;                                                                                         // 162
      }                                                                                                              // 163
      var setStatus = function(err,res) {                                                                            // 164
        data.status = {error:err,result:res};                                                                        // 165
      }                                                                                                              // 166
      if (transaction) {                                                                                             // 167
        var options = {instant:true};                                                                                // 168
        if (c2optionsHashRequired) {                                                                                 // 169
          options = _.extend(options,EditableText.collection2options || {});                                         // 170
        }                                                                                                            // 171
      }                                                                                                              // 172
      switch (action) {                                                                                              // 173
        case 'insert' :                                                                                              // 174
          if (Meteor.isServer) {                                                                                     // 175
            // run all string fields through sanitizeHtml                                                            // 176
            data.context = EditableText.sanitizeObject(data.context);                                                // 177
          }                                                                                                          // 178
          if (transaction) {                                                                                         // 179
            if (data.objectTypeText || data.transactionInsertText) {                                                 // 180
              tx.start(data.transactionInsertText || 'add ' + data.objectTypeText);                                  // 181
            }                                                                                                        // 182
            data.context = EditableText._callback.call(data,'beforeInsert',data.context) || data.context;            // 183
            var new_id = tx.insert(Collection,data.context,options,setStatus);                                       // 184
            EditableText._callback.call(data,'afterInsert',Collection.findOne({_id:new_id}));                        // 185
            if (data.objectTypeText || data.transactionInsertText) {                                                 // 186
              tx.commit();                                                                                           // 187
            }                                                                                                        // 188
          }                                                                                                          // 189
          else {                                                                                                     // 190
            data.context = EditableText._callback.call(data,'beforeInsert',data.context) || data.context;            // 191
            var new_id = (c2optionsHashRequired) ? Collection.insert(data.context,EditableText.collection2options,setStatus) : Collection.insert(data.context,setStatus);
            EditableText._callback.call(data,'afterInsert',Collection.findOne({_id:new_id}));                        // 193
          }                                                                                                          // 194
          return new_id;                                                                                             // 195
          break;                                                                                                     // 196
        case 'update' :                                                                                              // 197
          if (Meteor.isServer) {                                                                                     // 198
            var sanitized = false;                                                                                   // 199
            if (modifier["$set"] && _.isString(modifier["$set"][data.field])) {                                      // 200
            // run through sanitizeHtml                                                                              // 201
              newValue = modifier["$set"][data.field] = EditableText.sanitizeString(modifier["$set"][data.field]);   // 202
              sanitized = true;                                                                                      // 203
            }                                                                                                        // 204
            if (modifier["$set"] && _.isArray(modifier["$set"][data.field])) {                                       // 205
              newValue = modifier["$set"][data.field] = _.map(modifier["$set"][data.field],function(str) {return EditableText.sanitizeString(str);});
              sanitized = true;                                                                                      // 207
            }                                                                                                        // 208
            if (modifier["$set"] && _.isNumber(modifier["$set"][data.field])) {                                      // 209
              newValue = modifier["$set"][data.field];                                                               // 210
              sanitized = true;                                                                                      // 211
            }                                                                                                        // 212
            if (modifier["$addToSet"] && _.isString(modifier["$addToSet"][data.field])) {                            // 213
              newValue = modifier["$addToSet"][data.field] = EditableText.sanitizeString(modifier["$addToSet"][data.field]);
              sanitized = true;                                                                                      // 215
            }                                                                                                        // 216
            if (modifier["$push"] && _.isString(modifier["$push"][data.field])) {                                    // 217
              newValue = modifier["$push"][data.field] = EditableText.sanitizeString(modifier["$push"][data.field]); // 218
              sanitized = true;                                                                                      // 219
            }                                                                                                        // 220
            if (!sanitized) {                                                                                        // 221
              throw new Meteor.Error('Wrong data type sent for update');                                             // 222
            }                                                                                                        // 223
          }                                                                                                          // 224
          else {                                                                                                     // 225
            newValue = (modifier["$set"] && modifier["$set"][data.field]) || (modifier["$addToSet"] && modifier["$addToSet"][data.field]) || (modifier["$push"] && modifier["$push"][data.field]);
          }                                                                                                          // 227
          data.newValue = newValue;                                                                                  // 228
          data.oldValue = data.context[data.field];                                                                  // 229
          if (transaction) {                                                                                         // 230
            if (data.transactionUpdateText || data.objectTypeText) {                                                 // 231
              tx.start(data.transactionUpdateText || 'update ' + data.objectTypeText);                               // 232
            }                                                                                                        // 233
            data.context = EditableText._callback.call(data,'beforeUpdate',data.context) || data.context;            // 234
            tx.update(Collection,data.context._id,modifier,options,setStatus);                                       // 235
            EditableText._callback.call(data,'afterUpdate',Collection.findOne({_id:data.context._id}));              // 236
            if (data.transactionUpdateText || data.objectTypeText) {                                                 // 237
              tx.commit();                                                                                           // 238
            }                                                                                                        // 239
          }                                                                                                          // 240
          else {                                                                                                     // 241
            data.context = EditableText._callback.call(data,'beforeUpdate',data.context) || data.context;            // 242
            if (c2optionsHashRequired) {                                                                             // 243
              Collection.update({_id:data.context._id},modifier,EditableText.collection2options,setStatus);          // 244
            }                                                                                                        // 245
            else {                                                                                                   // 246
              Collection.update({_id:data.context._id},modifier,setStatus);                                          // 247
            }                                                                                                        // 248
            EditableText._callback.call(data,'afterUpdate',Collection.findOne({_id:data.context._id}));              // 249
          }                                                                                                          // 250
          break;                                                                                                     // 251
        case 'remove' :                                                                                              // 252
          if (transaction) {                                                                                         // 253
            if (data.transactionRemoveText || data.objectTypeText) {                                                 // 254
              tx.start(data.transactionRemoveText || 'remove ' + data.objectTypeText);                               // 255
            }                                                                                                        // 256
            data.context = EditableText._callback.call(data,'beforeRemove',data.context) || data.context;            // 257
            tx.remove(Collection,data.context._id,{instant:true},setStatus);                                         // 258
            EditableText._callback.call(data,'afterRemove',data.context);                                            // 259
            if (data.transactionRemoveText || data.objectTypeText) {                                                 // 260
              tx.commit();                                                                                           // 261
            }                                                                                                        // 262
          }                                                                                                          // 263
          else {                                                                                                     // 264
            data.context = EditableText._callback.call(data,'beforeRemove',data.context) || data.context;            // 265
            Collection.remove({_id:data.context._id},setStatus);                                                     // 266
            EditableText._callback.call(data,'afterRemove',data.context);                                            // 267
          }                                                                                                          // 268
          break;                                                                                                     // 269
      }                                                                                                              // 270
    }                                                                                                                // 271
  }                                                                                                                  // 272
});                                                                                                                  // 273
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/babrahams:editable-text/lib/editable_text_server.js                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
if (typeof EditableText === 'undefined') {                                                                           // 1
  EditableText = {};                                                                                                 // 2
}                                                                                                                    // 3
                                                                                                                     // 4
// Only used in the _editableTextWrite method detects the presence of aldeed:collection2                             // 5
EditableText.collection2Options = {filter: true, validate: true};                                                    // 6
                                                                                                                     // 7
EditableText.sanitizeString = function(string) {                                                                     // 8
  var sanitizedString = sanitizeHtml(string,EditableText._allowedHtml());                                            // 9
  /*if (string !== sanitizedString) {                                                                                // 10
    console.log("Sanitized: ", string);                                                                              // 11
    console.log("To: ", sanitizedString);                                                                            // 12
  }*/                                                                                                                // 13
  return sanitizedString;                                                                                            // 14
}                                                                                                                    // 15
                                                                                                                     // 16
EditableText.sanitizeObject = function(obj,allow) {                                                                  // 17
  _.each(obj,function(val,key) {                                                                                     // 18
    if (_.isString(obj[key])) {                                                                                      // 19
      var original = obj[key];                                                                                       // 20
      obj[key] = EditableText.sanitizeString(obj[key]);                                                              // 21
      if (original !== obj[key]) {                                                                                   // 22
        console.log("Sanitized: ", original);                                                                        // 23
        console.log("To: ",obj[key]);                                                                                // 24
      }                                                                                                              // 25
    }                                                                                                                // 26
    // If it's another object, need to recurse into that object and clean up strings                                 // 27
    if (_.isObject(obj[key])) {                                                                                      // 28
      obj[key] = EditableText.sanitizeObject(obj[key]);                                                              // 29
    }                                                                                                                // 30
  });                                                                                                                // 31
  return obj;                                                                                                        // 32
}                                                                                                                    // 33
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['babrahams:editable-text'] = {
  EditableText: EditableText
};

})();

//# sourceMappingURL=babrahams_editable-text.js.map
