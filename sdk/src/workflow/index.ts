// OM Workflow - Decision Loops & State Machines
// LangGraph-style workflow orchestration

import { useState, useEffect, useCallback, useRef } from 'react';

// ===== Types =====

export type WorkflowState = Record<string, any>;

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'task' | 'condition' | 'parallel' | ' subworkflow';
  execute: (state: WorkflowState) => Promise<WorkflowState>;
  next?: string | string[];
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: (state: WorkflowState) => boolean;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: Record<string, WorkflowNode>;
  edges: WorkflowEdge[];
  initial: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentNode?: string;
  state: WorkflowState;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  history: { node: string; state: WorkflowState; timestamp: Date }[];
}

// ===== Workflow Engine =====

export class WorkflowEngine {
  private workflow: Workflow;
  private running = false;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
  }

  async execute(initialState: WorkflowState = {}): Promise<WorkflowState> {
    this.running = true;
    let state = { ...initialState };
    let currentNodeId = this.workflow.initial;
    const history: { node: string; state: WorkflowState; timestamp: Date }[] = [];

    while (this.running && currentNodeId) {
      const node = this.workflow.nodes[currentNodeId];
      if (!node) break;

      try {
        state = await node.execute(state);
        history.push({ node: currentNodeId, state: { ...state }, timestamp: new Date() });
        
        // Find next node(s)
        const edges = this.workflow.edges.filter(e => e.from === currentNodeId);
        const nextEdge = edges.find(e => !e.condition || e.condition(state));
        
        if (!nextEdge) break;
        currentNodeId = nextEdge.to;
      } catch (error) {
        throw error;
      }
    }

    return state;
  }

  stop() {
    this.running = false;
  }
}

// ===== Reactive Hooks =====

export function useWorkflow(config: {
  workflow: Workflow;
  initialState?: WorkflowState;
  pollInterval?: number;
}) {
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [loading, setLoading] = useState(false);
  const engineRef = useRef<WorkflowEngine | null>(null);

  const execute = async (initialState?: WorkflowState) => {
    setLoading(true);
    engineRef.current = new WorkflowEngine(config.workflow);
    
    const runId = crypto.randomUUID();
    setRun({
      id: runId,
      workflowId: config.workflow.id,
      status: 'running',
      state: initialState || config.initialState || {},
      startedAt: new Date(),
      history: [],
    });

    try {
      const finalState = await engineRef.current.execute(initialState || config.initialState || {});
      setRun(prev => prev ? {
        ...prev,
        status: 'completed',
        state: finalState,
        completedAt: new Date(),
      } : null);
    } catch (error) {
      setRun(prev => prev ? {
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Workflow failed',
      } : null);
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    engineRef.current?.stop();
    setLoading(false);
  };

  return { run, loading, execute, cancel };
}

// ===== Pre-built Decision Nodes =====

export const DecisionNodes = {
  // Always execute next node
  passthrough: (next: string): WorkflowNode => ({
    id: 'passthrough-' + next,
    name: 'Passthrough',
    type: 'task',
    next,
    execute: async (state) => state,
  }),

  // Check condition and branch
  condition: (config: {
    id: string;
    name: string;
    check: (state: WorkflowState) => boolean;
    trueNode: string;
    falseNode: string;
  }): WorkflowNode => ({
    id: config.id,
    name: config.name,
    type: 'condition',
    execute: async (state) => {
      const result = config.check(state);
      return { ...state, __condition: result, __next: result ? config.trueNode : config.falseNode };
    },
  }),

  // Filter/reduce state
  transform: (config: {
    id: string;
    name: string;
    transform: (state: WorkflowState) => WorkflowState;
    next: string;
  }): WorkflowNode => ({
    id: config.id,
    name: config.name,
    type: 'task',
    next: config.next,
    execute: config.transform,
  }),

  // API call node
  api: (config: {
    id: string;
    name: string;
    endpoint: string;
    next: string;
  }): WorkflowNode => ({
    id: config.id,
    name: config.name,
    type: 'task',
    next: config.next,
    execute: async (state) => {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      return { ...state, ...await res.json() };
    },
  }),

  // Loop with max iterations
  loop: (config: {
    id: string;
    name: string;
    maxIterations: number;
    body: WorkflowNode;
    condition: (state: WorkflowState) => boolean;
    doneNode: string;
  }): WorkflowNode => ({
    id: config.id,
    name: config.name,
    type: 'task',
    execute: async (state) => {
      let current = { ...state };
      let iterations = 0;
      
      while (config.condition(current) && iterations < config.maxIterations) {
        current = await config.body.execute(current);
        iterations++;
      }
      
      return { ...current, __iterations: iterations };
    },
  }),
};

// ===== Workflow Templates =====

export const WorkflowTemplates = {
  // Data Ingestion Pipeline
  ingestionPipeline: (config: {
    id: string;
    validateSource: string;
    validateSchema: string;
    transform: string;
    loadTarget: string;
    notify: string;
  }): Workflow => ({
    id: config.id,
    name: 'Ingestion Pipeline',
    nodes: {
      validateSource: {
        id: 'validateSource',
        name: 'Validate Source',
        type: 'task',
        next: 'validateSchema',
        execute: async (state) => ({ ...state, validated: true }),
      },
      validateSchema: {
        id: 'validateSchema',
        name: 'Validate Schema',
        type: 'task',
        next: 'transform',
        execute: async (state) => ({ ...state, schemaValid: true }),
      },
      transform: {
        id: 'transform',
        name: 'Transform Data',
        type: 'task',
        next: 'loadTarget',
        execute: async (state) => ({ ...state, transformed: true }),
      },
      loadTarget: {
        id: 'loadTarget',
        name: 'Load to Target',
        type: 'task',
        next: 'notify',
        execute: async (state) => ({ ...state, loaded: true }),
      },
      notify: {
        id: 'notify',
        name: 'Notify',
        type: 'task',
        execute: async (state) => ({ ...state, notified: true }),
      },
    },
    edges: [
      { from: 'validateSource', to: 'validateSchema' },
      { from: 'validateSchema', to: 'transform' },
      { from: 'transform', to: 'loadTarget' },
      { from: 'loadTarget', to: 'notify' },
    ],
    initial: 'validateSource',
  }),

  // Approval Workflow
  approvalWorkflow: (config: {
    id: string;
    approverNode: string;
    approveNode: string;
    rejectNode: string;
  }): Workflow => ({
    id: config.id,
    name: 'Approval Workflow',
    nodes: {
      start: {
        id: 'start',
        name: 'Request Approval',
        type: 'task',
        next: config.approverNode,
        execute: async (state) => ({ ...state, status: 'pending_approval' }),
      },
      [config.approverNode]: {
        id: config.approverNode,
        name: 'Wait for Approval',
        type: 'condition',
        next: [config.approveNode, config.rejectNode],
        execute: async (state) => state,
      },
      [config.approveNode]: {
        id: config.approveNode,
        name: 'Approved',
        type: 'task',
        execute: async (state) => ({ ...state, approved: true }),
      },
      [config.rejectNode]: {
        id: config.rejectNode,
        name: 'Rejected',
        type: 'task',
        execute: async (state) => ({ ...state, approved: false }),
      },
    },
    edges: [
      { from: 'start', to: config.approverNode },
    ],
    initial: 'start',
  }),
};