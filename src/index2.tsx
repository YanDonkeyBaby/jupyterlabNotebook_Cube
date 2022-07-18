import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { Widget } from '@lumino/widgets';
// import { ICodeCellModel } from '@jupyterlab/cells';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';

/**
 * A notebook widget extension that adds a widget in the notebook header (widget below the toolbar).
 */
export class WidgetExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension object.
   *
   * @param panel
   * @param context
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const widget = new Widget({ node: Private.createNode() });
    widget.addClass('jp-myextension-myheader');
    console.log('widget----', widget);
    // panel.contentHeader.insertWidget(0, widget);
    console.log('panel===', panel);
    const notebook = panel.content;
    console.log('Notebook===', notebook);

    // notebook.contentFactory.editorFactory;
    // notebook.node.appendChild(Private.createNode());
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
    notebook.mode = 'command';

    const newCell = notebook?.model?.contentFactory.createCodeCell({ cell });
    console.log('newCell==', newCell);
    console.log('cells==', notebook.model?.cells);
    // notebook.model?.cells.insert(
    //   notebook.activeCellIndex + 1,
    //   newCell as ICodeCellModel
    // );
    console.log('activeCellIndex===', notebook.activeCellIndex);
    console.log('activeCell===', notebook.activeCell);
    return new DisposableDelegate(() => {
      widget.dispose();
    });
  }
}

/**
 * Activate the extension.
 *
 * @param app
 */
function activate(app: JupyterFrontEnd): void {
  app.docRegistry.addWidgetExtension('Notebook', new WidgetExtension());
}

/**
 * Private helpers
 */
namespace Private {
  /**
   * Generate the widget node
   */
  export function createNode(): HTMLElement {
    const span = document.createElement('span');
    span.textContent = 'My custom header22';
    return span;
  }
}
/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: '@jupyterlab/dataCube:plugin',
  // id: 'my-extension-name:widgetPlugin',
  autoStart: true
};
/**
 * Export the plugin as default.
 */
export default plugin;
