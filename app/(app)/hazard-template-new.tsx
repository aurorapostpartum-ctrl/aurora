import { HazardTemplateBuilder } from '../../src/features/templates/HazardTemplateBuilder';
import { RoleGate } from '../../src/navigation/RoleGate';
import { useAuth } from '../../src/providers/AuthProvider';

export default function HazardTemplateNewScreen() {
  return (
    <RoleGate allow={['manager']}>
      <HazardTemplateNewContent />
    </RoleGate>
  );
}

function HazardTemplateNewContent() {
  const { person } = useAuth();
  if (!person) return null;
  return <HazardTemplateBuilder mode="create" actorId={person.id} />;
}
