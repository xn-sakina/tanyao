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

#### Multi GitHub accounts

example:

```ini
# .gitconfig
[includeIf "gitdir:~/code_base_name/"]
path = ~/.gitconfig-code_base_name
```

```ini
# ~/.gitconfig-code_base_name

[user]
  name = github_user_id
  email = github_email
[core]
  excludesfile = ~/.gitignore_global
  sshCommand = ssh -i ~/.ssh/id_ed25519
[init]
  defaultBranch = main
```

See [How to Use Two GitHub Accounts on a Macbook the Right Way](https://fayazahmed.com/articles/how-to-use-two-github-accounts-on-a-macbook-the-right-way)

## Options

#### `--progress`

alias: `-p`

Show git clone progress.

#### `--depth`

alias: `-d`

Git clone depth.

## Thanks/Inspiration

 - [projj](https://github.com/popomore/projj) : Manage repository easily.

## License

MIT