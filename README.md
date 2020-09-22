# Visual Studio Code File Template Manager Extension

This is an extension for Visual Studio Code to manage file templates and create new files from said templates.

## Disclaimer

This is still in alpha so do not be surprised if you experience bugs.

The first stable release will be 1.0.0. In the meantime, **be aware that you may lose your templates when upgrading**.

## Features

1. Create file templates.
2. Create new files from file templates.
3. Create groups of file templates to generate multiple files from a single command.
4. Also in the future, directly select the template in the explorer context menu. I'm waiting for
Visual Studio Code to support dynamic contribution to the context menu for that one.

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

1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Create a new file template`.
1. Choose where you want to store it. It can be either:
   - A global file template: it can be used on all your projects. It is saved in the extension storage folder.
   - A local template: it will be stored in one of your currently open workspace folders, and will only be available inside that folder. It can be useful if you want to share the templates with everyone on your team, they just need the extension and are good to go.
1. Give a name to your template. It does not have to be unique. Example: `React component`.
1. Specify the file name of your file template. See [Template file name](#template-file-name) for more information.
1. Specify if your file template can be used outside of a file template group. This can be useful if you know you will never use a file template by itself, but always alongside other file templates.
1. Your file template content should open in the editor. You can erase the comment (it is just here to give you some information), and type the file template content in the editor. The format of the file template content is [`ejs`](https://ejs.co/). See [Variables in the templates](#variables-in-the-templates) for a list of all variables available when writing your templates. Don't forget to save, it's still just a file.

Example of a file template content:
```jsx
import React, { memo } from 'react';

export const <%= baseFileName %>Base = ({
  ...props
}) => {

};

<%= baseFileName %>Base.displayName = '<%= baseFileName %>';

<%= baseFileName %>Base.propTypes = {

};

<%= baseFileName %>Base.defaultProps = {

};

export default memo(<%= baseFileName %>Base);
```

#### Edit an existing template

1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Edit a file template`.
1. Select where the file template you want to edit is stored. It is where you chose to store it when you created it.
1. Select the file template to edit.
1. Edit your file template (and save).

#### Edit the metadata of an existing template

This one is for editing the information that you gave when you created a file template.

1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Edit a file template metadata`.
1. Select where the file template you want to edit is stored. It is where you chose to store it when you created it.
1. Select the file template to edit.
1. The inputs are the same as [Create a new file template](#create-a-new-file-template).

#### Delete an existing template

1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Remove a file template`.
1. Select where the file template you want to remove is stored. It is where you chose to store it when you created it.
1. Select the template to remove.
1. Press `F` to pay respect.

### File template groups

Template groups are a way to group your templates (surprisedpikachu.jpg) to generate multiple files from a single command. For example, you may have a `React component` template and a `React component stories` template, that you need to generate everytime you create a new React component. Instead of doing the [Create a new file from a template](#create-a-new-file-from-a-template) process twice every time, you can define a template group with both templates, and generate both files with [Create new files from a template group](#create-new-files-from-a-template-group).

When creating a file template group, you can only put file templates that are saved in the same folder (i.e. a global file template group can only use global file templates, and a local file template group can only use the local file templates of the same folder).

#### Create a new file template group

1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Create a new file template group`.
1. Choose where you want to store it. See [File template groups](#file-template-groups) for more information.
1. Select the files templates to put in the group.
1. Give a name to your file template group. It does not have to be unique, but you won't be able to differentiate which is which so you probably should.
1. Specify if the template file names of all file templates of the group use the same values for their variables. See [Template file name inside file template groups](#inside-file-template-groups) for more information.

#### Edit an existing file template group metadata

This one is for editing the information that you gave when you created a file template group.

1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Edit a file template group metadata`.
1. Select where the file template group you want to edit is stored. It is where you chose to store it when you created it.
1. Select the file template group to edit.
1. The inputs are the same as [Create a new file template group](#create-a-new-file-template-group).

#### Delete an existing file template group

1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Remove a file template group`.
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

## File template manager configuration

You can create a local configuration for the file template manager so you can decide where the templates are stored.

```json
{
  "templatesFolderPath": ".templates/",
  "variables": {
    "foo": "aaa",
    "bar": "bbb"
  }
}
```

- **templatesFolderPath** *(string)* - The folder where the file templates and groups are stored. It is relative to the workspace folder root. Default: `'.templates/'`
- **variables** *{ [key: string]: any }* - A map of variables available in your file templates content. Keys must be a valid JavaScript variable name.

### Write the configuration

We use [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig) with the module name `filetemplatemanager` to load the configuration, so go check out their documentation to know where you can write it. It only looks inside the current folder.

**TL;DR**: You can add a `.filetemplatemanagerrc.json` file at the root of your workspace folder. If you want JS, you can use `.filetemplatemanagerrc.js`, and export the config from that module.

You can also use the following command. It initializes the configuration if it does not exist for the selected folder:
1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Edit the configuration of a folder of the workspace`.
1. If you already had a configuration, it will open, otherwise, it will initialize it with the defaults and open it (as a JSON file).

### Global configuration

As for workspace folders, the configuration file can be initialized by using the `edit` command:
1. Open the command palette (`ctrl+shift+p` on Windows).
1. Select `[File template manager] Edit global configuration`.
1. If you already had a configuration, it will open, otherwise, it will initialize it with the defaults and open it (as a JSON file).

NB: the `templatesFolderPath` key is ignored. For the global file templates, the folder will always be `'.templates/'`.

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
- **timestamp**: computed when creating the file using the file template.
- **relativeFilePath**: computed when creating the file using the file template.
- **fileName**: computed when creating the file using the file template.
- **baseFileName**: computed when creating the file using the file template.

## Release Notes

See the [Changelog](CHANGELOG.md).
