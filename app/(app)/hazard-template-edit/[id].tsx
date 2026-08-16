import { useLocalSearchParams } from 'expo-router';

import { EmptyState, Screen } from '../../../src/components/ui';
import { getHazardTemplate } from '../../../src/data/selectors';
import { HazardTemplateBuilder } from '../../../src/features/templates/HazardTemplateBuilder';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';

export default function HazardTemplateEditScreen() {
  return (
    <RoleGate allow={['manager']}>
      <HazardTemplateEditContent />
    </RoleGate>
  );
}

function HazardTemplateEditContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = useAuth();
  const template = getHazardTemplate(id);

  if (!template || !person) {
    return (
      <Screen glow={false}>
        <EmptyState icon="warning-outline" title="Template not found" />
      </Screen>
    );
  }

  return <HazardTemplateBuilder mode="edit" template={template} actorId={person.id} />;
}
