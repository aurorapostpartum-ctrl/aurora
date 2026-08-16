import { ChecklistTemplateBuilder } from '../../src/features/templates/ChecklistTemplateBuilder';
import { RoleGate } from '../../src/navigation/RoleGate';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ChecklistTemplateNewScreen() {
  return (
    <RoleGate allow={['manager']}>
      <ChecklistTemplateNewContent />
    </RoleGate>
  );
}

function ChecklistTemplateNewContent() {
  const { person } = useAuth();
  if (!person) return null;
  return <ChecklistTemplateBuilder mode="create" actorId={person.id} />;
}
