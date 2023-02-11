# tanyao

Git repo clone and multi-account manager

## Install

```bash
  pnpm i -g tanyao
```

## Usage

1. Init config on first use :

    ```bash
      tanyao init
    ```

2. [Config](#config) your `base` directory and git account info.

3. Clone repo from anywhere :

    ```bash
      tanyao clone https://github.com/xn-sakina/tanyao.git
      # or
      tanyao clone git@github.com:xn-sakina/tanyao.git
      # or ... 
      tanyao clone https://github.com/xn-sakina/tanyao.git ./tmp-path
    ```
  
    directory structure :

    ```ts
    base
      ├── github.com
      │   └── xn-sakina
      │       └── tanyao
      └── gitlab.com
          └── owner
              └── repo
    ```

## Config

Open `~/.config/tanyao/config.json`, set up a code `base` and git account info :

```ts
// ~/.config/tanyao/config.json
{
  "base": "/Users/username/Documents/Code",
  "codebase": [
    {
      "url": "github.com",
      "username": "github-username",
      "email": "i@domain.com"
    },
    {
      "url": "gitlab.com",
      "username": "gitlab-username",
      "email": "admin@domain.com"
    }
  ],
  "alias": {
    "github://": "https://github.com/"
  }
}
```

### Advanced config

#### Shell alias (Recommend)

```bash
# ~/.zshrc

alias -s git="tanyao clone"
```

This will make the :

```bash
$ https://github.com/xn-sakina/tanyao.git
# equal
$ tanyao clone https://github.com/xn-sakina/tanyao.git
```

See [Suffix aliases (-s) in Zsh](https://www.stefanjudis.com/today-i-learned/suffix-aliases-in-zsh/) learn more.

#### Flexible `base`

```ts
// ~/.config/tanyao/config.json
{
  "base": [
    // use `process.env.CODE_BASE`
    "{CODE_BASE}/dir", 
    // multiple `base`, select when clone
    "Other/Codebase/Path"
  ]
}
```

## Thanks/Inspiration

 - [projj](https://github.com/popomore/projj) : Manage repository easily.

## License

MIT