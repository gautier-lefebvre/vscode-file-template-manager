# File Template Manager for Visual Studio Code

[See on the VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=gautier-lfbvr.file-template-manager).

This is an extension for Visual Studio Code to manage file templates and create new files from said templates.

I created this because as a React developer, I was tired of always having to manually create the same files over and over again. To fix this, I spent a lot more time writing an extension than I would ever have lost creating the files manually. Oh well.

## Disclaimer

This is still in alpha so do not be surprised if you experience bugs.

The first stable release will be 1.0.0. In the meantime, **be aware that you may lose your templates when upgrading**. This seems highly unlikely now though.

## Features

This is an overview of the features. For more detailed information, keep scrolling.

### File templates

Create file templates using the `[File template manager] Create a new file template` command in the command palette (`ctrl`+`shift`+`p`). You will follow a simple wizard 🧙 to register a file template.

File templates are written using [ejs](https://ejs.co/) format. This gives you more flexibility to interact with variables in the template.

For example, you may create a file template with the following manifest and content:

```json
{
  "name": "React component",
  "fileTemplateName": "{{name}}.jsx"
}
```

```jsx
// Created on <%= timestamp %>.
import React, { memo } from 'react';

export const <%= baseFileName %>Base = () => (
  <div />
);

<%= baseFileName %>Base.displayName = '<%= baseFileName %>';

<%= baseFileName %>Base.propTypes = {

};

<%= baseFileName %>Base.defaultProps = {

};

export default memo(<%= baseFileName %>Base);
```

You can now create files from the template by right-clicking a folder in your open folder and selecting `New file from template`.

Using `React component` (created above) and specifying `name` as `MyComponent` when the extension prompts you, this creates a file `MyComponent.jsx` with the following content:

```jsx
// Created on 2020-09-22T14:25:17.095Z.
import React, { memo } from 'react';

export const MyComponentBase = () => (
  <div />
);

MyComponentBase.displayName = 'MyComponent';

MyComponentBase.propTypes = {

};

MyComponentBase.defaultProps = {

};

export default memo(MyComponentBase);
```

### File template groups

Additionally, you can define groups of templates, which allow you to generate multiple files from a single command.

For example, you can define 3 templates:

- **React component**: `{{name}}.jsx`.
- **React component scss module**: `{{name}}.module.scss`.
- **React component stories**: `{{name}}.stories.mdx`.

Then group these 3 templates inside a group `React component group`.

You may now use `React component group`, set `name` to `MyComponent` when the extension prompts you, which will create the files `MyComponent.jsx`, `MyComponent.module.scss` and `MyComponent.stories.mdx`, with the content of each template.

### Global / Local templates

Templates and groups can either be registered globally or locally.

- **Globally**: Templates and groups are stored in the extension global storage folder.
  - They will be available for use in any project you open with VSCode.
  - This is useful if you have multiple unrelated projects with the same technologies.
- **Locally**: Local templates and groups are stored in your project folder (or any project folder of your workspace if you use [multi-root workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces)).
  - They will only be available when creating files in that specific project folder.
  - This is useful if you want to share the templates with your project team, and version them (the templates, not your colleagues).

Groups can only link templates within the same folder (global or local).

### Use templates from the explorer context menu

In the future, you will be able to select your templates from the explorer context menu. Unfortunately, this is not supported yet by the VSCode Extension API.

<!-- ## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something -->

## Known Issues

Your file template content will not have syntax highlighting. In the future, you might be prompted to specify which language your file template uses so it can be set when opening the content file.

## How to

### Manage your templates

#### Create a new file template

1. Select `[File template manager] Create a new file template` in the command palette (`ctrl`+`shift`+`p`).
1. Choose where you want to store it. See [Global / Local templates](#global--local-templates) for more information.
1. Give a name to your template. It does not have to be unique. Example: `React component`.
1. Specify the file name of your file template. See [Template file name](#template-file-name) for more information.
1. Specify if your file template can be used outside of a file template group. This can be useful if you know you will never use a file template by itself, but always alongside other file templates.
1. Your file template content should open in the editor. You can erase the comment (it is just here to give you some information), and type the file template content in the editor. The format of the file template content is [`ejs`](https://ejs.co/). See [Variables in the templates](#variables-in-the-templates) for a list of all variables available when writing your templates.

#### Edit an existing template

1. Select `[File template manager] Edit a file template` in the command palette (`ctrl`+`shift`+`p`).
1. Select where the file template you want to edit is stored. It is where you chose to store it when you created it.
1. Select the file template to edit.
1. Edit your file template (and save).

#### Edit the metadata of an existing template

This one is for editing the information that you gave when you created a file template.

1. Select `[File template manager] Edit a file template metadata` in the command palette (`ctrl`+`shift`+`p`).
1. Select where the file template you want to edit is stored. It is where you chose to store it when you created it.
1. Select the file template to edit.
1. The inputs are the same as [Create a new file template](#create-a-new-file-template).

#### Delete an existing template

1. Select `[File template manager] Remove a file template` in the command palette (`ctrl`+`shift`+`p`).
1. Select where the file template you want to remove is stored. It is where you chose to store it when you created it.
1. Select the template to remove.
1. Press `F` to pay respect.

### File template groups

#### Create a new file template group

1. Select `[File template manager] Create a new file template group` in the command palette (`ctrl`+`shift`+`p`).
1. Choose where you want to store it. See [File template groups](#file-template-groups) for more information.
1. Select the files templates to put in the group.
1. Give a name to your file template group. It does not have to be unique, but you won't be able to differentiate which is which so you probably should.
1. Specify if the template file names of all file templates of the group use the same values for their variables. See [Template file name inside file template groups](#inside-file-template-groups) for more information.

#### Edit an existing file template group metadata

This one is for editing the information that you gave when you created a file template group.

1. Select `[File template manager] Edit a file template group metadata` in the command palette (`ctrl`+`shift`+`p`).
1. Select where the file template group you want to edit is stored. It is where you chose to store it when you created it.
1. Select the file template group to edit.
1. The inputs are the same as [Create a new file template group](#create-a-new-file-template-group).

#### Delete an existing file template group

1. Select `[File template manager] Remove a file template group` in the command palette (`ctrl`+`shift`+`p`).
1. Select where the file template group you want to edit is stored. It is where you chose to store it when you created it.
1. Select the template group to remove.
1. Press `F` to pay respect.

### Use your templates

#### Create a new file from a file template

1. Right click on a folder in the explorer menu.
1. Select `New file from template`.
1. Select the file template to use.
1. Fill in the variables in your [template file name](#template-file-name) if any.
1. Hack.
1. ???
1. Profit.

#### Create new files from a file template group

1. Right click on a folder in the explorer menu.
1. Select `New files from template group`.
1. Select the template group to use.
1. Fill in the variables in your [template file names](#template-file-name) if any.
1. Hack.
1. ???
1. Profit.

## File template manager folder configuration

It is possible to configure your template manager folders (globally and locally), by:

- Manually creating a configuration file at the root of the corresponding folder.
  - We use [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig) with the module name `filetemplatemanager` to look **within the folder** (it will not look up the directory tree).
    - **TL;DR** you can create a `.filetemplatemanagerrc.json` file at the root of your workspace folder.
  - For the global folder, the configuration file goes inside the extension folder, but you can use the following command to generate it for you.
- Alternatively, you can use `[File template manager] Edit global configuration` or `File template manager] Edit workspace folder configuration` in the command palette, accordingly. If the configuration file does not exist, it will be created with the default values.

A folder configuration looks like this:

```json
{
  "templatesFolderPath": ".templates/",
  "variables": {
    "foo": "aaa",
    "bar": "bbb"
  }
}
```

- **templatesFolderPath** *(string)* - The folder where the file templates and groups are stored. It is relative to the workspace folder root.
  - Default: `'.templates/'`.
  - For the global configuration, this is ignored. The value is hardcoded to `'.templates/'`.
- **variables** *{ [varName: string]: any }* - A map of variables available in your file templates content. Keys must be a valid JavaScript variable name.

## Template file name

When creating/editing a template, you are prompted to enter a **Template file name**. In this file name, you can add some variables that will be prompted to you when you use the template.

For example, if your template file name is `{{foo}}.{{bar}}.scss`, you will be prompted for the values of `foo` and `bar` when creating a new file from the file template.

Moreover, the variables `foo` and `bar` will be available to you in your file template content.

### Inside file template groups

Your file template groups have an additional setting so you can configure whether or not all file templates or the group share the same variable values.

If yes, and you have file templates with file names `{{foo}}.{{bar}}.jsx` and `{{foo}}.md`, you will be prompted once for `foo` and once for `bar`.

If not, you will be prompted for `foo` twice (once for each file) and for `bar` once.

In either case, `foo` and `bar` will be available in both your files, but `foo` will have a different value in each file.

## Variables in the file templates

When defining a template in `ejs`, these are the provided variables, in ascending order of priority (later points override previous points if variables have the same name):
- All variables defined in your global configuration folder. See [Global configuration](#global-configuration).
- All variables defined in the configuration of the workspace folder where the file will be created. I.e. if you use a global template in the workspace folder "aaa", you still have access to the variables set in the folder "aaa". See [File template manager configuration](#file-template-manager-configuration).
- All variables defined in the [template file name](#template-file-name) of other files of a file template group if you are using your file template via a file template group.
- All variables defined in the [template file name](#template-file-name) of the current file template.
- **groupTemplates** *(string[])* - Names of the templates in the current group.
- **timestamp** *(string)* - The current date in ISOString format.
- **relativeFilePath** *(string)* - The path of your file relative to your workspace folder root.
- **fileName** *(string)* - The name of your file (with extension).
- **baseFileName** *(string)* - The name of your file, without the extensions. E.g. if your generated file name is `foo.module.scss`, baseFileName is `foo`.

### Example

Considering the following:

A global configuration:
```json
{
  "variables": {
    "foo": "aaa",
    "bar": "bbb",
    "baz": "ccc"
  }
}
```

A local configuration in the workspace folder where your file template is used:
```json
{
  "variables": {
    "foo": "yolo",
  }
}
```

Other file templates in your file template group with file names:
- `{{name}}.module.scss`
- `{{name}}.stories.mdx`
- `{{name}}.{{baz}}.{{id}}.whatever`

The current file template with file name:
- `{{name}}.jsx`

Inside your file template content, you have access to:
- **foo**: `'yolo'` (overridden in the local configuration).
- **bar**: `'bbb` (global configuration).
- **baz**: overridden and prompted to the user in `{{name}}.{{baz}}.{{id}}.whatever`.
- **name**: overridden in your current template file name.
- **id**: prompted to the user in `{{name}}.{{baz}}.{{id}}.whatever`.
- **groupTemplates**: computed when creating the file using the file template.
- **timestamp**: computed when creating the file using the file template.
- **relativeFilePath**: computed when creating the file using the file template.
- **fileName**: computed when creating the file using the file template.
- **baseFileName**: computed when creating the file using the file template.

## Release Notes

See the [Changelog](CHANGELOG.md).
