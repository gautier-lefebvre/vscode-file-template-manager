# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0]
### Added
- Prompt the user for any extra variable found inside a file template content that was not resolved from the template configuration, template file name, or global variables.

## [1.0.0]
### Fixed
- Fixed the order of commands in explorer context so New File is always the first.

### Chore
- Released 1.0.0 and removed alpha warning from `README.md`.

## [0.5.1]
### Fixed
- Consecutive code blocks appeared as one in VSCode extension README preview.

## [0.5.0]
### Added
- When creating files using a template group, open all files in the editor.
- `groupTemplates` variable in templates.

## [0.4.0]
### Changed
- Configuration files must be in their respective folders (limit cosmiconfig search algorithm to the current folder).

### Added
- Performance boost by getting rid of glob patterns to find file templates and file template groups metadata, and by caching configurations / templates / template groups. This speeds some things up by ~1500%.
- Commands to init/edit the global configuration, and the configuration of each folder of the current workspace.
- Remove file templates from file template groups that use them.
- Use webpack to bundle the extension.

## [0.3.0]
### Changed
- Rewrote everything from scratch. You will lose your file templates because I changed how they are defined and stored.

### Added
- Global and local file templates and file template groups.
- Variables in template file names.
- More variables in file templates.

## [0.2.0]
### Added
- When the extension prompts to select a template, the extension is displayed next to the name.

## [0.1.0]
### Added
- Manage templates.
- Manage template groups.
- Create file from template.
- Create files from template groups.
