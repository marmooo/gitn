# gitn

A git manager for many repositories.

## Installation

```
deno install -fr -A \
https://raw.githubusercontent.com/marmooo/gitn/main/gitn.js
```

## Usage

```
gitn clone vendor/ repos.lst
gitn pull vendor/ repos.lst
gitn push vendor/ repos.lst
gitn status . repos.lst
gitn add . repos.lst *
gitn commit . repos.lst -m "comment"
```

`repos.lst`

```
https://github.com/twbs/icons bootstrap-icons
https://github.com/google/material-design-icons
```

## License

MIT
