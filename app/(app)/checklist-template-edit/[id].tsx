import { useLocalSearchParams } from 'expo-router';

import { EmptyState, Screen } from '../../../src/components/ui';
import { getChecklistTemplate } from '../../../src/data/selectors';
import { ChecklistTemplateBuilder } from '../../../src/features/templates/ChecklistTemplateBuilder';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';

export default function ChecklistTemplateEditScreen() {
  return (
    <RoleGate allow={['manager']}>
      <ChecklistTemplateEditContent />
    </RoleGate>
  );
}

function ChecklistTemplateEditContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = useAuth();
  const template = getChecklistTemplate(id);

  if (!template || !person) {
    return (
      <Screen glow={false}>
        <EmptyState icon="checkbox-outline" title="Template not found" />
      </Screen>
    );
  }

  return <ChecklistTemplateBuilder mode="edit" template={template} actorId={person.id} />;
}
