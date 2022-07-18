// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/**
 * @packageDocumentation
 * @module running-extension
 */
import { Input } from 'antd';
import 'antd/dist/antd.css';
import React from 'react';
import { Widget } from '@lumino/widgets';
import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget, showDialog, Dialog } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
// import { Cell } from '@jupyterlab/cells';
import { ICellModel } from '@jupyterlab/cells';
import {
  INotebookTracker,
  NotebookPanel,
  Notebook
} from 'jupyterlab_notebook_cube';
import { Cell } from 'jupyterlab_cells_datacube';
import {
  IRunningSessionManagers,
  RunningSessionManagers
} from '@jupyterlab/running';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { listIcon } from '@jupyterlab/ui-components';
import { ElementExt } from '@lumino/domutils';

// import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

/**
 * The class name added to a running widget.
 */
const DATA_CUBE_CLASS = 'jp-DataCube';
const HEADER_CLASS = 'jp-DataCube-header';
const CONTENT_CLASS = 'jp-DataCube-content';
let app_: JupyterFrontEnd;
let tracker_: INotebookTracker;
interface IState {
  /**
   * Whether the widget had focus.
   */
  wasFocused: boolean;

  /**
   * The active cell before the action.
   */
  activeCell: Cell | null;
}

// interface ICubeSessionManagers extends IRunningSessionManagers {
//   registry: ISettingRegistry;
// }
/**
 *左侧特征工程
 *
 * @param props 参数
 * @param props.managers 管理器
 * @param props.translator 转换器
 * @returns dom
 */
function DataCubeComponent(props: {
  managers: IRunningSessionManagers;
  translator?: ITranslator;
}) {
  // const translator = props.translator || nullTranslator;
  // const trans = translator.load('jupyterlab');
  return (
    <>
      <div>
        <div className={HEADER_CLASS}>特征工程1.ipynb</div>
        <div className={CONTENT_CLASS}>
          <Input placeholder="Basic usage" />
          <ol onClick={handleClick}>
            <li>读取数据</li>
            <li>数据合并</li>
            <li>缺失值填充</li>
            <li>数据过滤</li>
            <li>选择列</li>
            <li>归一化</li>
            <li>数据保存</li>
          </ol>
        </div>
      </div>
    </>
  );
}
/**
 *
 * @param tracker
 * @param shell
 * @param args
 */
function getCurrent(
  tracker: INotebookTracker,
  shell: JupyterFrontEnd.IShell
): NotebookPanel | null {
  const widget = tracker.currentWidget;
  console.log('widget---', tracker.currentWidget);
  if (widget) {
    shell.activateById(widget.id);
  }

  return widget;
}
/**
 *
 * @param notebook
 */
function isNotebookRendered(notebook: Notebook): boolean {
  const translator = notebook.translator;
  const trans = translator.load('jupyterlab');

  if (notebook.remainingCellToRenderCount !== 0) {
    showDialog({
      body: trans.__(
        `Notebook is still rendering and has for now (%1) remaining cells to render.

Please wait for the complete rendering before invoking that action.`,
        notebook.remainingCellToRenderCount
      ),
      buttons: [Dialog.okButton({ label: trans.__('Ok') })]
    }).catch(reason => {
      console.error(
        'An error occurred when displaying notebook rendering warning',
        reason
      );
    });
    return false;
  }
  return true;
}
/**
 *
 * @param notebook
 */
function getState(notebook: Notebook): IState {
  return {
    wasFocused: notebook.node.contains(document.activeElement),
    activeCell: notebook.activeCell as Cell<ICellModel> | null
  };
}
/**
 *
 * @param notebook
 * @param state
 * @param scrollIfNeeded
 */
function handleState(
  notebook: Notebook,
  state: IState,
  scrollIfNeeded = false
): void {
  const { activeCell, node } = notebook;

  if (state.wasFocused || notebook.mode === 'edit') {
    notebook.activate();
  }

  if (scrollIfNeeded && activeCell) {
    ElementExt.scrollIntoViewIfNeeded(node, activeCell.node);
  }
}
/**
 *
 */
function createNode(): HTMLElement {
  const span = document.createElement('span');
  span.textContent = 'My custom header';
  return span;
}
/**
 *
 * @param notebook
 * @param mode
 */
export function loadData(notebook: Notebook): void {
  if (!notebook.model || !notebook.activeCell) {
    return;
  }
  if (!isNotebookRendered(notebook)) {
    return;
  }
  const state = getState(notebook);
  const cell = {
    cell_type: 'code',
    execution_count: null,
    id: '',
    metadata: {},
    outputs: [],
    source:
      '#@param {"id":"data-references"}\n' +
      'data_reference_kwargs=[\n' +
      '  {\n' +
      '     "dataset":"Default",\n' +
      '     "dataset_entity":"Default",\n' +
      '     "file_list":None,\n' +
      '     "file_type":csv,\n' +
      '  }\n' +
      ']\n'
  };
  const model = notebook.model;

  notebook.mode = 'command';

  const newCell = model.contentFactory.createCodeCell({ cell });

  const cells = notebook.model.cells;

  // cells.beginCompoundOperation();
  cells.insert(notebook.activeCellIndex + 1, newCell);
  // cells.endCompoundOperation();

  notebook.activeCellIndex++;
  console.log('activeCellIndex===', notebook.activeCellIndex);
  console.log('activeCell===', notebook.activeCell);
  const inputArea = notebook.activeCell.inputArea;
  console.log('inputArea===', inputArea);
  const widget = new Widget({ node: createNode() });
  console.log('renderInput1111===', widget);
  // inputArea.addWidget(widget);
  // inputArea.renderInput(widget);
  // inputArea.showEditor();
  notebook.deselectAll();
  handleState(notebook, state);
}
/**
 *
 * @param notebook
 */
export function loadDataCopy(notebook: Notebook): void {
  if (!notebook.model || !notebook.activeCell) {
    return;
  }
  if (!isNotebookRendered(notebook)) {
    return;
  }
  const state = getState(notebook);
  const cell = {
    cell_type: 'code',
    execution_count: null,
    id: '',
    metadata: {},
    outputs: [],
    source:
      '#@param {"id":"data-references"}\n' +
      'data_reference_kwargs=[\n' +
      '  {\n' +
      '     "dataset":"Default",\n' +
      '     "dataset_entity":"Default",\n' +
      '     "file_list":None,\n' +
      '     "file_type":csv,\n' +
      '  }\n' +
      ']\n'
  };
  const model = notebook.model;

  notebook.mode = 'command';

  const newCell = model.contentFactory.createCodeCell({ cell });

  const cells = notebook.model.cells;

  // cells.beginCompoundOperation();
  cells.insert(notebook.activeCellIndex + 1, newCell);
  // cells.endCompoundOperation();

  notebook.activeCellIndex++;
  notebook.deselectAll();
  handleState(notebook, state);
}
/**
 *
 * @param app
 */
function handleClick(): void {
  console.log('我被点击了');
  const { shell } = app_;
  console.log('shell==', shell);

  const current = getCurrent(tracker_, shell);
  console.log('I am load data ====');
  if (current) {
    return loadData(current.content);
  }
}
class DataCubeWidget extends ReactWidget {
  /**
   * Construct a new running widget.
   *
   * @param managers 管理器
   * @param translator 转换器
   */
  constructor(managers: IRunningSessionManagers, translator?: ITranslator) {
    super();
    this.managers = managers;
    this.translator = translator || nullTranslator;

    // this can't be in the react element, because then it would be too nested
    this.addClass(DATA_CUBE_CLASS);
  }

  protected render() {
    return (
      <DataCubeComponent
        managers={this.managers}
        translator={this.translator}
      />
    );
  }

  private managers: IRunningSessionManagers;
  protected translator: ITranslator;
}
/**
 * The default running sessions extension.
 */
const plugin: JupyterFrontEndPlugin<IRunningSessionManagers> = {
  activate,
  id: '@jupyterlab/dataCube:plugin',
  provides: IRunningSessionManagers,
  requires: [ISettingRegistry, ITranslator],
  optional: [ILayoutRestorer, ILabShell],
  autoStart: true
};

/**
 * Export the plugin as default.
 */
export default plugin;

/**
 * Activate the running plugin.
 *
 * @param app
 * @param registry
 * @param translator
 * @param restorer
 * @param tracker
 * @param labShell
 */
function activate(
  app: JupyterFrontEnd,
  registry: ISettingRegistry,
  translator: ITranslator,
  restorer: ILayoutRestorer | null,
  tracker: INotebookTracker,
  labShell: ILabShell | null
): IRunningSessionManagers {
  const trans = translator.load('jupyterlab');
  const runningSessionManagers = new RunningSessionManagers();
  const dataCubeWidget = new DataCubeWidget(runningSessionManagers, translator);
  dataCubeWidget.id = 'jp-data-cube';
  dataCubeWidget.title.caption = trans.__('data-cube');
  dataCubeWidget.title.icon = listIcon;
  dataCubeWidget.node.setAttribute('role', 'region');
  dataCubeWidget.node.setAttribute('aria-label', trans.__('data-cube'));
  app_ = app;
  tracker_ = tracker;
  window.addEventListener(
    'message',
    event => {
      // const origin = event.origin;
      console.log("I'm inside firame---get message from outside===", event);
      // 接受消息后给ifame外面发送消息
      window.parent.postMessage(`get messages ${event.data}`, event.origin);
    },
    false
  );
  // const PLUGIN_ID = '@jupyterlab/extensionmanager-extension:plugin';
  console.log('registry===', Boolean(registry));
  // if (registry) {
  //   console.log(111);
  //   void registry.set(PLUGIN_ID, 'enabled', false);
  // }

  if (restorer) {
    restorer.add(dataCubeWidget, 'data-cube');
  }

  app.shell.add(dataCubeWidget, 'left', { rank: 200 });

  return runningSessionManagers;
}
