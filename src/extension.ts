// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const DEFAULT_COLORS = [
	{ label: "微应用", color: "#007081" },
	{ label: '容器', color: '#20683f' },
	{ label: "红色", color: "#ff0000" },
	{ label: "绿色", color: "#00ff00" },
	{ label: "蓝色", color: "#0000ff" },
	{ label: "黄色", color: "#ffff00" },
	{ label: "紫色", color: "#800080" },
	{ label: "橙色", color: "#ffa500" }
];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "statusbar-colorizer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('statusbar-colorizer.setColor', async () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('请先打开一个项目文件夹');
			return;
		}

		const config = vscode.workspace.getConfiguration('statusbarColorizer');
		const savedColors = config.get<Record<string, string>>('colors') || {};

		// 创建快速选择项
		const items = DEFAULT_COLORS.map(c => ({
			label: c.label,
			description: c.color,
			color: c.color
		}));

		// 添加自定义颜色选项
		items.push({
			label: "自定义颜色...",
			description: "输入自定义的十六进制颜色代码",
			color: ""
		});

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: '选择状态栏颜色'
		});

		if (!selected) {return;}

		let colorToSet = selected.color;

		if (selected.label === "自定义颜色...") {
			const input = await vscode.window.showInputBox({
				placeHolder: "输入十六进制颜色代码 (例如: #ff0000)",
				validateInput: (value: string) => {
					return /^#[0-9a-fA-F]{6}$/.test(value) ? null : '请输入有效的十六进制颜色代码';
				}
			});
			if (!input) {return;}
			colorToSet = input;
		}

		// 保存颜色设置
		savedColors[workspaceFolder.uri.fsPath] = colorToSet;
		await config.update('colors', savedColors, vscode.ConfigurationTarget.Global);

		// 应用颜色
		updateStatusBarColor(colorToSet);
	});

	context.subscriptions.push(disposable);

	// 在启动时应用保存的颜色
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (workspaceFolder) {
		const config = vscode.workspace.getConfiguration('statusbarColorizer');
		const savedColors = config.get<Record<string, string>>('colors') || {};
		const savedColor = savedColors[workspaceFolder.uri.fsPath];
		if (savedColor) {
			updateStatusBarColor(savedColor);
		}
	}
}

function updateStatusBarColor(color: string) {
	// 使用 VS Code API 更新状态栏颜色
	void vscode.workspace.getConfiguration().update('workbench.colorCustomizations', {
		'statusBar.background': color,
		'statusBar.noFolderBackground': color,
		'statusBar.debuggingBackground': color,
		// 字体颜色
		"statusBar.foreground": "#ffffff",
    "statusBar.noFolderForeground": "#ffffff",
    "statusBar.debuggingForeground": "#ffffff",
	}, vscode.ConfigurationTarget.Workspace);
}

// this method is called when your extension is deactivated
export function deactivate() {}
