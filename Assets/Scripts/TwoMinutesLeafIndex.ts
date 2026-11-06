/** LEAF's discovery index. Scenarios are added after the first live scene survey. */
import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator";
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata";
import {TwoMinutesLeafScenario} from "./TwoMinutesLeafScenario";

@component
export class TwoMinutesLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "two_minutes_exit_both", typename: TwoMinutesLeafScenario.getTypeName(), parameters: {kind: "exit"}},
    {id: "two_minutes_lid_drag_containment", typename: TwoMinutesLeafScenario.getTypeName(), parameters: {kind: "containment"}},
    {id: "two_minutes_accessible_containment", typename: TwoMinutesLeafScenario.getTypeName(), parameters: {kind: "accessible"}},
    {id: "two_minutes_water_recovery", typename: TwoMinutesLeafScenario.getTypeName(), parameters: {kind: "water"}},
    {id: "two_minutes_spreading_rejects_containment", typename: TwoMinutesLeafScenario.getTypeName(), parameters: {kind: "spreading"}},
    {id: "two_minutes_reset", typename: TwoMinutesLeafScenario.getTypeName(), parameters: {kind: "reset"}},
    {id: "two_minutes_ik_exit", typename: TwoMinutesLeafScenario.getTypeName(), parameters: {kind: "ik"}}
  ];
}
