# Planter

Planter is a CLI created to help you maintain and use project starters quickly and easily. Stop wasting time setting up projects and start new ones with planters!

**Contents**

- [Getting Started](#getting-started)
- [Commands](#commands)
- [Local Repos](#local-repos)
- [Ignore Files](#ignore-files)
- [About](#about)

**What is a Planter?**

A planter is a repo that you have added to your list that you can then use `create` to quickly start a new project from with no git history. You can also use `create` with a remote repo directly without referencing an existing planter. 

Think of a planter as an easily accessible bookmark to a repo. You can use that bookmark to create a brand new project from that repo with no git history. 

Check out this documentation and more at [planter.dev](https://www.planter.dev/).

## Getting Started

### Install

```bash
> npm i -g @planter/cli
```

### Adding your own planter

```bash
> planter add my-planter user/repo
Planter my-planter added.

> planter create my-planter my-project
🪴 Planted!
Used my-planter at my-project
```

### Using a remote repo

```bash
> planter create user/repo my-project
```

## Commands

- [create](#create)
- [add](#add)
- [list](#list)
- [edit](#edit)
- [info](#info)
- [pin](#pin)

---

### create

`planter [source] [dir] [options]`

Create a new project using a planter or public repo.

**Args**

`[source]`

The name of a planter or a public repo. planter uses [degit](https://github.com/Rich-Harris/degit) under the hood, so any valid repo URL for degit works. 

If the source is a local planter, the .gitignore or .planterignore will be respected (see `add`).

`[dir]`

Directory of the new project.

**Options**

`-f`, `--flag`

Force the created directory to overwrite an existing one.

**Examples**

```bash
# create is the default command in planter
planter

# Interative mode will guide you through create
planter create

# Quickly create by passing a planter name and dir
planter create my-planter my-project

# Passing the source only will prompt you for dir
planter create my-planter

# Create using a repo directly
planter create user/repo
planter create github:user/repo
planter create git@github.com:user/repo
planter create https://github.com/user/repo
```

---

### add

`planter add <name> <location> [options]`

Add a planter to your list.

**Args**

`<name>`

The name of the planter to use as a reference.

`<location>`

The repo URL or name.

**Options**

`-L`, `--local`

Treat the location as a “local repo” instead of a remote repo.

By using the local option planter allows the location to be a local folder rather than a remote repo. When running `create` with a local planter, the .gitignore or .planterignore will be respected.

Read more about Local repos.

**Examples**

```bash
# Add a planter using a remote repo
planter add my-planter user/repo
planter add my-planter github:user/repo
planter add my-planter git@github.com:user/repo
planter add my-planter https://github.com/user/repo

# Add a planter using a local repo
planter add my-planter ./path/to/my-local-dir -L
```

---

### list

`planter list [options]`

List available planters.

**Options**

`-a`, `--alphanumeric`

Sorts list of planters alphanumerically (ignores pinned). By default planters are sorted by add date and pinned planters are at the top (see `pin`).

**Examples**

```bash
# Usage
planter list

# Output
* my-pinned-planter
- my-planter
- my-other-planter
```

---

### edit

`planter edit <name> [options]`

Description

**Args**

`<name>`

Name of the planter to edit.

Description

**Options**

`-n`, `--name`

Edit the name of a planter.

`-l`, `--location`

Edit the location of a planter.

`-d`, `--delete`

Remove a planter from your list.

`-f`, `--force`

Edit something... *dangerously*. (Force the edit without any prompts).

`-R`, `--remote`

Set the location type to remote.

`-L`, `--local`

Set the location type to local. (See `add` for more information.)

**Examples**

```bash
# Use options to edit your planter
planter edit old-name -n new-name
planter edit old-name -n new-name -l user/new-repo

# Set planter location type to local
planter edit my-planter -L
```

---

### info

`planter info <name>`

Prints all info about a planter in your list.

**Args**

`<name>`

Name of the planter to show info for.

**Examples**

```bash
# Usage
planter info my-planter

# Output
Name:             my-planter
Location:         user/repo-name
Type:             Remote
Pinned:           1
Date Added:       Aug 24, 2022 7:40:08 PM
```

---

### pin

`planter pin <name> [position]`

Pins a planter to the top of your list.

**Args**

`<name>`

Name of the planter to pin.

`[position]`

Specific position to set the planter at. (1 being the top of the list). 

Defaults to 1. 

**Options**

`-u`, `--unpin`

Removes position from the planter.

**Examples**

```bash
# Pin to top
planter pin my-planter

# Pin to position 5
planter pin my-planter 5
```

If the position is greater than the number of planters is passed, the highest possible number will be used instead.

```bash
# Pin to the bottom-most position (assuming there are only 5 planters)
planter pin my-planter 100

# Output
my-planter pinned to position 5.
```

---

## Local Repos

Local repos enable folks to quickly use Planter without needing a remote repo or even a git repository at all. This flexibility enables planter to be used for unpublished code such as a frequently used code sandbox or work in progress.

When planted, a local repo will respect ignore files.

**Example**

```
my-project/
├─ src/
│   ├─ script.js
│   ├─ style.css
│   └─ index.html
└─ .planterignore
```

> **Note**<br>
> It doesn’t have to be a repo — it can just be a folder!

## Ignore Files

When using local repos Planter will respect ignore files. Planter supports `.gitignore` and/or `.planterignore`. `.planterignore` works the same way as a `.gitignore` file does with git. If both files exist, Planter will default to the `.planterignore`. 

This means you could tell Planter to ignore unique files in `.planterignore`, while git still utilizes the `.gitignore` file. Alternatively, if you want to ignore the same set of files for both, you can just keep a `.gitignore`.

## About

This was created by Matt & Matthew, the co-founders of Ditto Digital.

We made this to spend less time setting up projects, and have a way to maintain a personal library of project starters, both local and remote.

Check out [planter.dev](http://planter.dev) for more info.