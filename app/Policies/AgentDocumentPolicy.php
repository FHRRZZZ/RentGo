<?php

namespace App\Policies;

use App\Models\AgentDocument;
use App\Models\User;

class AgentDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'mitra']);
    }

    public function view(User $user, AgentDocument $agentDocument): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('mitra')
            && $agentDocument->agentProfile?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'mitra']);
    }

    public function update(User $user, AgentDocument $agentDocument): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('mitra')
            && $agentDocument->agentProfile?->user_id === $user->id;
    }

    public function delete(User $user, AgentDocument $agentDocument): bool
    {
        return $this->update($user, $agentDocument);
    }

    public function verify(User $user, AgentDocument $agentDocument): bool
    {
        return $user->hasRole('admin');
    }

    public function restore(User $user, AgentDocument $agentDocument): bool
    {
        return false;
    }

    public function forceDelete(User $user, AgentDocument $agentDocument): bool
    {
        return false;
    }
}
