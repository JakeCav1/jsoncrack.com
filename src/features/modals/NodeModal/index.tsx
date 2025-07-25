import React, { useState } from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, ScrollArea, Button, Textarea, Group } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import useGraph from "../../editor/views/GraphView/stores/useGraph";

// Ensure we always return valid JSON for editing
const dataToString = (data: any) => {
  if (data === undefined) return "";
  if (data === null) return "null";
  if (typeof data === "string") return JSON.stringify(data); // keeps quotes
  if (typeof data === "number" || typeof data === "boolean") return data.toString();
  return JSON.stringify(data, null, 2);
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const selectedNode = useGraph(state => state.selectedNode);
  const path = selectedNode?.path || "";
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(
    dataToString(selectedNode?.text)
  );
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setEditValue(dataToString(selectedNode?.text));
    setError(null);
  }, [selectedNode]);

  const handleSave = () => {
    try {
      let newValue;
      if (editValue.trim() === "") {
        newValue = "";
      } else {
        try {
          newValue = JSON.parse(editValue);
        } catch {
          // If not valid JSON, treat as string
          newValue = editValue;
        }
      }
      // Use id instead of path for unique node update
      if (
        selectedNode &&
        typeof useGraph.getState().updateNodeValue === "function"
      ) {
        useGraph.getState().updateNodeValue(selectedNode.id, newValue);
      } else {
        // For testing: log the update
        console.log(
          "Would update node at",
          selectedNode?.id,
          "with value",
          newValue
        );
      }
      setEditMode(false);
      setError(null);
    } catch (e) {
      setError("Invalid JSON format.");
    }
  };

  if (!selectedNode) {
    return (
      <Modal opened={opened} onClose={onClose} title="Node Content">
        <Text>No node selected.</Text>
      </Modal>
    );
  }

  return (
    <Modal title="Node Content" size="auto" opened={opened} onClose={onClose} centered>
      <Stack py="sm" gap="sm">
        <Stack gap="xs">
          <Text fz="xs" fw={500}>
            Content
          </Text>
          <ScrollArea.Autosize mah={250} maw={600}>
            {editMode ? (
              <>
                <Textarea
                  value={editValue}
                  onChange={e => setEditValue(e.currentTarget.value)}
                  minRows={6}
                  autosize
                  miw={350}
                  maw={600}
                  styles={{ input: { fontFamily: "monospace" } }}
                  error={error}
                />
                {error && (
                  <Text color="red" size="xs" mt={4}>
                    {error}
                  </Text>
                )}
              </>
            ) : (
              <CodeHighlight
                code={dataToString(selectedNode?.text)}
                miw={350}
                maw={600}
                language="json"
                withCopyButton
              />
            )}
          </ScrollArea.Autosize>
          {editMode ? (
            <Group gap="xs" mt="xs">
              <Button size="xs" color="green" onClick={handleSave}>
                Save
              </Button>
              <Button size="xs" variant="default" onClick={() => { setEditMode(false); setError(null); }}>
                Cancel
              </Button>
            </Group>
          ) : (
            <Button size="xs" mt="xs" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          )}
        </Stack>
        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={path}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};