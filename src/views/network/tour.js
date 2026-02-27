import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

function tourFactory(app) {
  return new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
      },
      buttons: [
        {
          text: 'Prev',
          action() {
            return this.back();
          },
        },
        {
          text: 'Next',
          action() {
            return this.next();
          },
        },
      ],
    },
    steps: [
      {
        title: 'Guided tour of the path planner',
        text: `Welcome to this guided tour through retrosynthesis planning using our interactive path planning tool. 
This will demonstrate the purpose of the tool and explain the user interface using a real example.`,
        buttons: [
          {
            text: 'End Tour',
            action() {
              return this.cancel();
            },
            secondary: true,
          },
          {
            text: 'Next',
            action() {
              return this.next();
            },
          },
        ],
      },
      {
        title: 'Start with a target compound',
        text: `You start the retrosynthetic planning by entering a target compound's SMILES string here. 
If the name resolver is enabled (server icon to the left is green) you can also enter a chemical name. 
The name will be resolved using a third-party server (PubChem). 
If you wish to turn the name resolving feature off, click the server icon and it will turn red. 
For this tutorial we're going to explore an example reaction for <a href="https://en.wikipedia.org/wiki/Fluconazole" target="_blank">Fluconazole</a>. 
Press 'Next' to continue!`,
        attachTo: {
          element: '#target',
          on: 'bottom',
        },
      },
      {
        title: 'Fluconazole',
        text: `Here's the SMILES string for Fluconazole. 
If you're unfamiliar with the SMILES format, click on the edit icon to open the drawing tool or try using software like 
ChemDraw to draw a structure and copy it's SMILES string (right click -> molecule -> copy as -> SMILES). 
Click 'Next to continue!`,
        attachTo: {
          element: '#target',
          on: 'bottom',
        },
        when: {
          show() {
            app.target = 'OC(Cn1cncn1)(Cn1cncn1)c1ccc(F)cc1F';
          },
        },
      },
      {
        title: 'One-step retrosynthesis results',
        text: `When the results are ready, they will be shown in the main window on the left. 
The target molecule you entered will be shown in the center inside a <span style="color: #1965B0;">blue</span> box (it is currently selected). 
You can click and drag on empty space in the window to navigate through the entire network when zoomed in. 
Scrolling inside the window will zoom in and out. You can rearrange nodes by clicking and dragging on them. 
Take a second to enjoy the inverted gravity model, courtesy of <a href="http://visjs.org" target="_blank">vis.js</a>. 
Click 'Next' to continue.`,
        attachTo: {
          element: '#network',
          on: 'right',
        },
        when: {
          show() {
            if (app.dataGraph.nodes.length === 0) {
              app.changeTarget();
            }
          },
        },
      },
      {
        title: 'Predicted reactions',
        text: `The children node(s) of your target molecule represent predicted <b>reactions</b> that may result in your target molecule. 
The number inside this node is the rank of the precursor, scored by the precursor prioritization method currently selected (more on this later). 
On the left you can see that the highest ranked prediction is highlighted.`,
        attachTo: {
          element: '#network',
          on: 'right',
        },
        when: {
          show() {
            const smiles = 'Fc1ccc(C2(Cn3cncn3)CO2)c(F)c1.c1nc[nH]n1>>OC(Cn1cncn1)(Cn1cncn1)c1ccc(F)cc1F';
            const node = app.dispGraph.nodes.get({ filter: (item) => item.smiles === smiles })[0];
            app.network.selectNodes([node.id]);
            app.showInfo({ nodes: [node.id] });
          },
        },
      },
      {
        title: 'Reactants',
        text: `The children node(s) of <b>reactions</b> represent <b>chemicals</b>, and are the predicted reactants for this reaction. 
Chemicals in a <span style="color: #DC050C;">red</span> box were not found in the buyables database. 
Chemicals in a <span style="color: #4EB265;">green</span> box were found in the database and are buyable.
Other colors indicate whether the chemical appears in the reaction dataset for the current model.
This information is also indicated by the circles below each molecule image, with $ for buyable, R for history as a reactant, and P for history as a product.`,
        attachTo: {
          element: '#network',
          on: 'right',
        },
      },
      {
        title: 'Reactants',
        text: `In this example, we'll see if we can predict a reaction to make the non-buyable reactant in the 
rank 1 reaction prediction from buyable starting materials (it's been selected for you).`,
        attachTo: {
          element: '#network',
          on: 'right',
        },
        when: {
          show() {
            const smiles = 'Fc1ccc(C2(Cn3cncn3)CO2)c(F)c1';
            const node = app.dispGraph.nodes.get({ filter: (item) => item.smiles === smiles })[0];
            app.network.selectNodes([node.id]);
            app.showInfo({ nodes: [node.id] });
          },
        },
      },
      {
        title: 'Expanding chemical nodes',
        text: `To make a new prediction for the non-buyable chemical, which been selected below, you can use the <b>Expand Node</b> button.
Click on this button to continue to the next step.`,
        attachTo: {
          element: '#expand-btn',
          on: 'bottom',
        },
        advanceOn: {
          selector: '#expand-btn',
          event: 'click',
        },
        buttons: [
          {
            text: 'Prev',
            action() {
              return this.back();
            },
          },
          {
            text: 'Next',
            action() {
              app.expandNode();
              return this.next();
            },
          },
        ],
      },
      {
        title: 'Expanding chemical nodes',
        text: `A new prediction was made for this non-buyable chemical, and when everything is ready, the results will be added to the network visualization. 
It might look hectic at first, but the appropriate node positions should resolve quickly (thanks again to the <a href="http://visjs.org" target="_blank">vis.js</a> inverted gravity!). 
If not, click and drag a node to give it a jiggle.`,
        attachTo: {
          element: '#network',
          on: 'right',
        },
      },
      {
        title: 'Result details',
        text: `You may have noticed there's been a lot going on on the right side of the screen in addition to the changes in the network visualization. 
On this side, details of the currently selected node are shown. In this case, a <b>chemical</b> node is selected. 
At the top you can see its SMILES string and its cost in $/g (if buyable).`,
        attachTo: {
          element: '#details',
          on: 'left',
        },
      },
      {
        title: 'Precursors',
        text: `If you've already made a retrosynthetic prediction for the currently selected <b>chemical</b>, you'll see a list of the precursor results. 
Each entry shows the reactants for the reaction to make the currently selected chemical. 
Additional information such as a relative score and the number of examples there were for the templates that support the suggested reaction are also shown. 
If you haven't performed a retrosynthetic prediction for the selected chemical, an <b>Expand Node</b> button will be shown.
Next, we'll take a closer look at the features in the top half of this panel`,
        attachTo: {
          element: '#details',
          on: 'left',
        },
      },
      {
        title: 'Interactive chemical image',
        text: `Below the SMILES, there is an interactive 2d rendering of the chemical structure.
The colored circles in the visualization indicate the quantity and diversity of suggested transformations involving each atom.
Selecting an atom by clicking on it will filter the precursors list to display only transformations where the selected atom reacts.`,
        attachTo: {
          element: '#ketcher-min-chemical',
          on: 'left',
        },
      },
      {
        title: 'Chemical node toolbar',
        text: 'Next, let\'s take a look at the buttons in this toolbar.',
        attachTo: {
          element: '#chemical-node-toolbar',
          on: 'left',
        },
      },
      {
        title: 'Expand Node',
        text: `This lets you run a new prediction for an already expanded node.
This may be useful if you want to see how changing settings may affect predictions.
Results from subsequent expansions are merged with any existing results by removing duplicates, re-clustering, and re-ranking based on score`,
        attachTo: {
          element: '#expand-btn-side',
          on: 'top',
        },
      },
      {
        title: 'Add Precursor',
        text: `This lets you add a custom SMILES as a precursor option for the chemical.
Once you've added a custom precursor, you can choose to expand it like any other node.
Note that ASKCOS currently does not verify whether the custom precursor is a reasonable reaction.`,
        attachTo: {
          element: '#add-precursor-btn',
          on: 'top',
        },
      },
      {
        title: 'View Recommended Templates',
        text: `This button will open a popup showing <em>all</em> of the templates which were recommended by the model, including those which did not successfully apply to the target molecule.
Viewing recommended templates can sometimes reveal other potential transformations which only failed to generate precursors due to minor template mismatches.`,
        attachTo: {
          element: '#view-rec-templates-btn',
          on: 'top',
        },
      },
      {
        title: 'Ban chemical',
        text: 'This button lets you ban a chemical for future IPP and tree builder predictions. Banned chemicals can be managed from My Banlist.',
        attachTo: {
          element: '#ban-chemical-btn',
          on: 'top',
        },
      },
      {
        title: 'Sorting options',
        text: 'Precursor suggestions can be sorted by a variety of different metrics. Please select a different scoring order and see how it changes the results.',
        attachTo: {
          element: '#sortingCategory',
          on: 'top',
        },
      },
      {
        title: 'Adding and removing reactions',
        text: `You may also notice there are many more precursor results shown on the right side here than were added into the network visualization (it's a scrolling list) - this is to keep things tidy in the visualization. 
By default, only the top 5 results (scored by retro 'score') are added to the visualization (this can be changed in the settings menu). 
The plus (+) and minus (-) buttons, when shown below the reaction, can be used to add or remove that reaction to or from the visualization. 
Go ahead and give it a try if you'd like. Click 'Next' to continue.`,
        attachTo: {
          element: '#details',
          on: 'left',
        },
      },
      {
        title: 'Result clustering, group similar',
        text: `You may have also noticed that some precursor ranks appear to be missing from the list. 
For example, the second result in the list for the currently selected chemical is ranked #8. 
This is because the 'Group Similar' option is enabled by default. 
With the option enabled, results perceived to be the same by an unsupervised machine learning clustering algorithm are collapsed into the same group. 
In this way, only 1 representative example for the top 5 groups are added to the visualization by default, making it easier to browse the meaningfully different transformations. 
Click on 'Next' to uncheck 'Group Similar' to reveal the hidden results.`,
        attachTo: {
          element: '#details',
          on: 'left',
        },
      },
      {
        title: 'Result clustering sorting options',
        text: 'Now with clustering disabled, you can see that all of the results are there. Click \'Next\' to re-enable clustering and to continue.',
        attachTo: {
          element: '#details',
          on: 'left',
        },
        when: {
          show() {
            app.allowCluster = false;
          },
          hide() {
            app.allowCluster = true;
          },
        },
      },
      {
        title: 'Viewing clusters',
        text: `You may want to view the clusters to see which predictions have been grouped together. 
Next to the green (+) or red (-) button to add or remove suggestions from the network visualization, there another button with 4 squares in it, this is the view cluster button. 
Click 'Next' to view the clusters.`,
        attachTo: {
          element: '#details',
          on: 'left',
        },
      },
      {
        title: 'Cluster UI',
        text: `Here you can see all of the different reactions that were grouped together in the same cluster. 
The green (+) or red (-) buttons can be used to choose a different variant of the reaction type and add it or remove it from the graph visualization. 
Click 'Next' to close the cluster UI popup and continue with the tutorial.`,
        when: {
          show() {
            app.openClusterPopoutModal(app.selected, app.currentPrecursors[0]);
          },
          hide() {
            app.closeClusterPopoutModal();
          },
        },
      },
      {
        title: 'Viewing reaction details',
        text: `If you have a reaction node selected, Rank number 1 in this example, the right side of your screen will show you details for that reaction. 
At the top you can see the reaction SMILES, a 2d drawing, and similar reaction scores that you have seen before. 
You will also see a list of links to templates that support the reaction. Clicking one will open a new tab with more details about each template. 
There is also a link to 'Evaluate reaction in new tab', which will let you predict reaction conditions and evaluate the reaction in the forward direction.`,
        attachTo: {
          element: '#details',
          on: 'left',
        },
        when: {
          show() {
            const smiles = 'Fc1ccc(C2(Cn3cncn3)CO2)c(F)c1.c1nc[nH]n1>>OC(Cn1cncn1)(Cn1cncn1)c1ccc(F)cc1F';
            const node = app.dispGraph.nodes.get({ filter: (item) => item.smiles === smiles })[0];
            app.network.selectNodes([node.id]);
            app.showInfo({ nodes: [node.id] });
          },
        },
      },
      {
        title: 'Understanding the network',
        text: `We can see that the prediction gave us a few reactions that use buyable starting materials 
(<b>reaction</b> nodes with children <b>chemical</b> nodes highlighted in green) to make the new target we were interested in. 
Now we have a full path to our original target, Fluconazole, starting with buyable compounds.`,
        attachTo: {
          element: '#network',
          on: 'right',
        },
      },
      {
        title: 'What do these buttons do?',
        text: 'Let\'s quickly discuss what the buttons in this row do.',
        attachTo: {
          element: '#toolbar-bottom',
          on: 'bottom',
        },
      },
      {
        title: 'Expand button',
        text: 'As you have seen before, the Expand button will perform a prediction on the selected node and display the results in the network visualisation.',
        attachTo: {
          element: '#expand-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Delete node button',
        text: 'In addition to expanding nodes, you can easily delete selected nodes, or children of a selected node using this button.',
        attachTo: {
          element: '#delete-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Collapse node button',
        text: `The 'Collapse children' button will group the currently selected node and its children into one cluster (this may be useful to keep things organized). 
Clicking this button with a cluster selected will expand it to show all of the nodes again.`,
        attachTo: {
          element: '#collapse-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Clear reactions button',
        text: 'This button will reset your target and clear all the reactions from the visualization.',
        attachTo: {
          element: '#clear-reactions-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Settings button',
        text: `There are various advanced settings for one-step/tree builder prediction parameters, as well as graph visualization options. 
Use this button to open the settings UI, where you can read more about each by hovering your mouse over the the tooltip icon (i).`,
        attachTo: {
          element: '#settings-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Hierarchical/Graph button',
        text: `Clicking on this button changes how the results are displayed below. 
The default is the graph layout, G, where the target is displayed in the center and the child nodes fan out in all directions. 
Clicking on this button will change the display to hierarchical layout where the target appears at the top of the tree and the child node(s) project downwards. 
Click on the button to try it out.`,
        attachTo: {
          element: '#hierarchical-button',
          on: 'bottom',
        },
      },
      {
        title: 'Center graph button',
        text: `This button will fit the network visualization inside the canvas. 
This is useful if you have zoomed in on a specific region but would like to reset the view.`,
        attachTo: {
          element: '#center-graph-button',
          on: 'bottom',
        },
      },
      {
        title: 'Refresh metadata button',
        text: `This button will allow you to update the price and history information for all chemical nodes.
This may be helpful if you want to see the effect of changing template prioritizer and buyables source settings, or if you're loading an older result.`,
        attachTo: {
          element: '#refresh-metadata-button',
          on: 'bottom',
        },
      },
      {
        title: 'Saving results',
        text: `If you are logged in, you can save the network to your saved results, similar to how tree builder results are saved. 
Once saved, you can access the result again from the <b>My Results</b> page. 
Saved results can also be shared with other users from the <b>My Results</b> page.`,
        attachTo: {
          element: '#save-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Downloading results',
        text: `You can save the network structure (JSON of nodes and edges) and download it to your computer. 
You may share these JSON files with your colleagues so that they can get excited about the molecules you are working on.`,
        attachTo: {
          element: '#download-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Uploading results',
        text: 'You can restore a previously downloaded network file here.',
        attachTo: {
          element: '#load-btn',
          on: 'bottom',
        },
      },
      {
        title: 'Enumerating paths',
        text: `This lets you enumerate retrosynthetic pathways to terminal precursors, based on the current terminal precursor settings.
In addition, this lets you re-enumerate paths for a tree builder job using different settings.
Once paths are enumerated, you can view them in the Tree Explorer tab.`,
        attachTo: {
          element: '#enumerate-paths-button',
          on: 'bottom',
        },
      },
      {
        title: 'Highlighting paths',
        text: `This will toggle highlighting of retrosynthetic paths in the network display below.
Paths will be enumerated first if they do not already exist.`,
        attachTo: {
          element: '#tree-view-switch',
          on: 'bottom',
        },
      },
      {
        title: 'Submit tree builder job',
        text: `You can start a tree builder job, using the target SMILES string, by clicking on this button. 
This is an asynchronous job, so you can continue examining the predictions in the main window below. 
Once the job has completed, a browser popup will appear informing you that the job has finished. 
Clicking on that popup will bring you to the tree builder visualization page.`,
        attachTo: {
          element: '#tb-submit',
          on: 'bottom',
        },
      },
      {
        title: 'Tree builder quick settings',
        text: `You can give your tree builder job a name using this dropdown menu, as well as choose between a few different preset settings. 
The tree builder job that gets submitted will show up in your saved results accessible from the <b>My Results</b> page, 
and a name can help identify this job later. If not provided, it will default to the SMILES string of your target. 
If you want more control over the tree builder parameters, you can go into the advanced settings and look for the <b>MCTS Tree Builder Settings</b> section.`,
        attachTo: {
          element: '#tb-submit-settings',
          on: 'bottom',
        },
      },
      {
        title: 'End of the tour',
        text: 'That\'s the end of the guided tour. Go ahead and change the target, and build your own reaction networks, or continue to expand this one further.',
        buttons: [
          {
            text: 'Prev',
            action() {
              return this.back();
            },
          },
          {
            text: 'Finish',
            action() {
              return this.cancel();
            },
          },
        ],
      },
    ],
  });
}

export { tourFactory };
