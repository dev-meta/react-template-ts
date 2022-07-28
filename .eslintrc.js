module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "extends": [
        "eslint:recommended",
        "plugin:react/jsx-runtime",
        "react-app",
        "plugin:jsx-a11y/recommended",
        "prettier"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "jsx-a11y",
        "@typescript-eslint"
    ],
    "rules": {
        // 使用ts时 eslint下的 no-unused-vars 不准确，禁用掉.
        // 使用@typescript-eslint/no-unused-vars代替
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],
        "react/jsx-first-prop-new-line": [1, "multiline"],
        "react/jsx-max-props-per-line": [
            1,
            {
                "maximum": 1
            }
        ]
    }
}
