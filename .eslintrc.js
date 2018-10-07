module.exports = {
    "plugins": [
      "import",
    ],
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parserOptions": {
        "ecmaFeatures": {
          "ecmaVersion": 8,
            "experimentalObjectRestSpread": true,
        },
        "sourceType": "module"
    },
    "extends": "eslint:recommended",
    "rules": {
        "import/no-unresolved": [
          "error",
          { commonjs: true, amd: true }
        ],
        "import/no-extraneous-dependencies": [
          "error",
          {
            "devDependencies": false,
            "optionalDependencies": false,
            "peerDependencies": false
          }
        ],
        "indent": [
            "error",
            2,
            {
              SwitchCase: 1,
            }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};
