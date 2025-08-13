// src/data/eventTypes.js
import GROOM_TASKS from "./groomTasks";
import BRIDE_TASKS from "./brideTasks";
import BAR_MITZVA_TASKS from "./barMitzvaTasks";

const EVENT_TYPES = [
  { id: "groom", label: "חתן", tasks: GROOM_TASKS },
  { id: "bride", label: "כלה", tasks: BRIDE_TASKS },
  { id: "barMitzva", label: "בר מצווה", tasks: BAR_MITZVA_TASKS },
  { id: "other", label: "אירוע אחר (מותאם אישית)", tasks: [] },
  // תוכל להוסיף פה עוד סוגים
];

export default EVENT_TYPES;
