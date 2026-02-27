<template>
    <v-dialog v-model="propShow" scrollable>
        <v-card>
            <v-card-title>
                Model Input/Output Details
            </v-card-title>
            <v-card-text class="py-5">
                <p class="text-h6"><strong>Required inputs:</strong></p>
                <ul>
                    <li>
                        <b>Solvent SMILES</b>:
                        SMILES of a solvent
                    </li>
                    <li>
                        <b>Solute SMILES</b>:
                        SMILES of a solute
                    </li>
                    <li>
                        <b>Temperature</b>:
                        Desired temperature (in K) at which solid solubility and solvation properties should be computed
                    </li>
                </ul>

                <p class="text-h6"><strong>Optional input set 1 - solute reference data:</strong></p>
                <p>
                    One can provide a reference solubility value of the same solute in a different solvent and/or at a
                    different
                    temperature to get a more accurate solubility prediction. All of the three values must be provided
                    together
                    for this option.
                </p>
                <ul>
                    <li>
                        <b>Ref. Solvent SMILES</b>:
                        SMILES of a reference solvent
                    </li>
                    <li>
                        <b>Ref. Solubility</b>:
                        Solubility of the input solute in a reference solvent at a reference temperature. In logS
                        (log10(mol/L))
                        unit.
                    </li>
                    <li>
                        <b>Ref. Temperature</b>:
                        Reference temperature in K
                    </li>
                </ul>

                <p class="text-h6"><strong>Optional input set 2 - solute thermo data:</strong></p>
                <p>
                    One can provide any or all of the values below to improve the temperature-dependent solubility
                    prediction.
                    Typically, ΔHsub298 is more important than Cpg298 and Cps298 to get a more accurate
                    temperature-dependent
                    solubility prediction.
                </p>
                <ul>
                    <li>
                        <b>ΔHsub298</b>:
                        Sublimation enthalpy of the input solute at 298 K in kcal/mol
                    </li>
                    <li>
                        <b>Cpg298</b>:
                        Heat capacity of the input solute in a gas phase at 298 K in cal/K/mol
                    </li>
                    <li>
                        <b>Cps298</b>:
                        Heat capacity of the input solute in a solid phase at 298 K in cal/K/mol
                    </li>
                </ul>

                <p class="text-h6"><strong>File format for uploads:</strong></p>
                <p>
                    Input parameters can also be provided by uploading a .csv or .json file. Column/field names should
                    match
                    the
                    parameter names for the <a href="/api/v2/solubility/" target="_blank">Solubility API</a>.
                    For .csv files, the header row is required, and all columns must be present, though empty values are
                    allowed.
                    For .json files, parameters should be specified as an array of objects, and each object is not
                    required
                    to have
                    all fields defined. Null values for empty fields are also accepted.
                </p>

                <details class="mb-3">
                    <summary>Example .csv input:</summary>
                    <v-card bg-variant="light">
                        <pre class="ma-0">solvent,solute,temp,ref_solvent,ref_solubility,ref_temp,hsub298,cp_gas_298,cp_solid_298
  CCCCO,c1ccoc1,298,,,,,,</pre>
                    </v-card>
                </details>

                <details class="mb-3">
                    <summary>Example .json input:</summary>
                    <v-card bg-variant="light">
                        <pre class="ma-0">[
  {
    "solvent": "CCCCO",
    "solute": "c1ccoc1",
    "temp": 298
  },
  {
    "solvent": "CCCCO",
    "solute": "c1ccoc1",
    "temp": 298,
    "ref_solvent": null,
    "ref_solubility": null,
    "ref_temp": null,
    "hsub298": null,
    "cp_gas_298": null,
    "cp_solid_298": null
  }
  ]</pre>
                    </v-card>
                </details>

                <h4 class="text-h6">Model Output Details</h4>
                <ul>
                    <li>
                        <b>logS (method1) [log10(mol/L)]</b>:
                        Predicted solubility of the input solute in the input solvent at the input temperature in
                        log10(mol/L).
                        This prediction is made using method 1, which approximates the temperature dependence of
                        solubility
                        using
                        the constant dissolution enthalpy at 298 K. Below 350 K, the prediction accuracy of method 1 and
                        method 2
                        is similar. Above 350 K, method 2 gives a more accurate prediction than method 1.
                        Please refer to our paper for more details.
                    </li>
                    <li>
                        <b>logS (method2) [log10(mol/L)]</b>:
                        Predicted solubility of the input solute in the input solvent at the input temperature in
                        log10(mol/L).
                        This prediction is made using method 2, which estimates the temperature dependence of solubility
                        using the
                        temperature-dependent dissolution enthalpy at 298 K. Method 2 provides more accurate prediction
                        than
                        method 1 at high temperature. However, method 2 is currently only available for around 100
                        common
                        solvents.
                        Please refer to our paper for more details.
                    </li>
                    <li>
                        <b>dGsolv [kcal/mol]</b>:
                        Predicted solvation free energy of the input solvent-solute pair at the input temperature in
                        kcal/mol.
                        This prediction is available if method 2 is available. The standard state of an ideal gas at a
                        concentration
                        of 1 mol/L dissolving as an ideal solution at a concentration of 1 mol/L is used.
                    </li>
                    <li>
                        <b>dHsolv [kcal/mol]</b>:
                        Predicted solvation enthalpy of the input solvent-solute pair at the input temperature in
                        kcal/mol.
                        This prediction is available if method 2 is available. The same standard state as dGsolvT is
                        used.
                    </li>
                    <li>
                        <b>dSsolv [cal/K/mol]</b>:
                        Predicted solvation entropy of the input solvent-solute pair at the input temperature in
                        cal/K/mol.
                        This prediction is available if method 2 is available. The same standard state as dGsolvT is
                        used.
                    </li>
                    <li>
                        <b>Pred. Hsub298 [kcal/mol]</b>:
                        Predicted sublimation enthalpy of the input solute at 298 K in kcal/mol.
                        If the input ΔHsub298 is provided by a user, this output will be empty.
                    </li>
                    <li>
                        <b>Pred. Cpg298 [cal/K/mol]</b>:
                        Predicted heat capacity of the input solute in a gas phase at 298 K in cal/K/mol.
                        If the input Cpg298 is provided by a user, this output will be empty.
                    </li>
                    <li>
                        <b>Pred. Cps298 [cal/K/mol]</b>:
                        Predicted heat capacity of the input solute in a solid phase at 298 K in cal/K/mol.
                        If the input Cps298 is provided by a user, this output will be empty.
                    </li>
                    <li>
                        <b>logS298 [log10(mol/L)]</b>:
                        Predicted solubility of the input solute in the input solvent at 298 K in log10(mol/L).
                    </li>
                    <li>
                        <b>Uncertainty logS298 [log10(mol/L)]</b>:
                        Model uncertainty in the predicted logS298 value in log10(mol/L). Estimated as the variance in
                        predictions
                        from an ensemble of models.
                    </li>
                    <li>
                        <b>dGsolv298 [kcal/mol]</b>:
                        Predicted solvation free energy of the input solvent-solute pair at 298 K in kcal/mol.
                    </li>
                    <li>
                        <b>Uncertainty dGsolv298 [kcal/mol]</b>:
                        Model uncertainty in the predicted dGsolv298 value in kcal/mol. Estimated as the variance in
                        predictions
                        from an ensemble of models.
                    </li>
                    <li>
                        <b>dHsolv298 [kcal/mol]</b>:
                        Predicted solvation enthalpy of the input solvent-solute pair at 298 K in kcal/mol.
                    </li>
                    <li>
                        <b>Uncertainty dHsolv298 [kcal/mol]</b>:
                        Model uncertainty in the predicted dHsolv298 value in kcal/mol. Estimated as the variance in
                        predictions
                        from an ensemble of models.
                    </li>
                    <li>
                        <b>E, S, A, B, L, V</b>:
                        Predicted Abraham solute parameters of the input solute.
                    </li>
                </ul>

                <h4 class="text-h6">Reference</h4>
                <p>
                    Vermeire, F. H.; Chung, Y.; Green, W. H.
                    Predicting Solubility Limits of Organic Solutes for a Wide Range of Solvents and Temperatures.
                    <a href="https://pubs.acs.org/doi/10.1021/jacs.2c01768" target="_blank">ACS Publications</a>
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="tonal" @click="close()">Ok</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { computed } from 'vue'
export default {
    name: "SolubilityModal",
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const propShow = computed({
            get() {
                return props.visible
            },
            set(newVal) {
                context.emit("close-dialog", newVal)
            }
        })

        const close = () => {
            context.emit("close-dialog", false)
        }

        return {
            propShow,
            close
        }
    }
}
</script>