import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Hash, Lock, ChevronDown, ChevronRight } from "lucide-react";
import { Channel, UserGroup } from "@/services/networking";
import { toast } from "sonner";

interface LeftSidebarProps {
  channels: Channel[];
  myGroups: UserGroup[];
  selectedChannel: Channel | null;
  selectedGroup: UserGroup | null;
  onSelectChannel: (channel: Channel) => void;
  onSelectGroup: (group: UserGroup) => void;
  onCreateGroup: () => void;
  allGroups?: UserGroup[];
}

const CATEGORIES = [
  { name: 'General', icon: '💬', color: 'text-blue-400' },
  { name: 'Founders', icon: '🚀', color: 'text-purple-400' },
  { name: 'Technology', icon: '🤖', color: 'text-cyan-400' },
  { name: 'Marketing', icon: '📈', color: 'text-green-400' },
  { name: 'Finance', icon: '💰', color: 'text-yellow-400' },
  { name: 'Career', icon: '💼', color: 'text-orange-400' },
  { name: 'Product', icon: '🛠️', color: 'text-pink-400' },
  { name: 'Freelance', icon: '🎨', color: 'text-indigo-400' },
  { name: 'Showcase', icon: '⭐', color: 'text-amber-400' },
];

export default function LeftSidebar({
  channels,
  myGroups,
  selectedChannel,
  selectedGroup,
  onSelectChannel,
  onSelectGroup,
  onCreateGroup,
  allGroups = [],
}: LeftSidebarProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map(c => c.name))
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.category]) {
      acc[channel.category] = [];
    }
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  const filteredChannels = search
    ? channels.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Search Results */}
          {filteredChannels ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Search Results
              </div>
              {filteredChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel?.id === channel.id}
                  onClick={() => onSelectChannel(channel)}
                />
              ))}
              {filteredChannels.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No channels found
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Categories */}
              {CATEGORIES.map((category) => {
                const categoryChannels = groupedChannels[category.name] || [];
                const isExpanded = expandedCategories.has(category.name);

                if (categoryChannels.length === 0) return null;

                return (
                  <div key={category.name} className="mb-2">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-secondary/50 rounded-md transition-colors group"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase flex-1 text-left">
                        {category.name}
                      </span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {categoryChannels.length}
                      </Badge>
                    </button>

                    {isExpanded && (
                      <div className="mt-1 space-y-0.5 ml-2">
                        {categoryChannels.map((channel) => (
                          <ChannelItem
                            key={channel.id}
                            channel={channel}
                            isSelected={selectedChannel?.id === channel.id}
                            onClick={() => onSelectChannel(channel)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* My Groups */}
              {myGroups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                    <span>My Groups</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {myGroups.length}
                    </Badge>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {myGroups.map((group) => (
                      <GroupItem
                        key={group.id}
                        group={group}
                        isSelected={selectedGroup?.id === group.id}
                        onClick={() => onSelectGroup(group)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Discover Groups */}
              {allGroups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                    <span>Discover Groups</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {allGroups.length}
                    </Badge>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {allGroups.map((group) => (
                      <GroupItem
                        key={group.id}
                        group={group}
                        isSelected={selectedGroup?.id === group.id}
                        onClick={() => onSelectGroup(group)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Create Group Button */}
      <div className="p-3 border-t border-border space-y-2">
        <Button
          onClick={onCreateGroup}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
        <Link
          to="/networking-terms"
          className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors py-1"
        >
          Community Terms
        </Link>
      </div>
    </div>
  );
}

function ChannelItem({
  channel,
  isSelected,
  onClick,
}: {
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-secondary/50 text-foreground"
      }`}
    >
      <Hash className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-sm flex-1 truncate text-left font-medium">
        {channel.name}
      </span>
      {channel.member_count > 0 && (
        <Badge
          variant="secondary"
          className={`h-5 px-1.5 text-xs ${isSelected ? "bg-primary/20" : ""}`}
        >
          {channel.member_count}
        </Badge>
      )}
    </button>
  );
}

function GroupItem({
  group,
  isSelected,
  onClick,
}: {
  group: UserGroup;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-left group ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-secondary/50 text-foreground"
      }`}
      title={`${group.name} - ${group.member_count || 0} members`}
    >
      {group.is_private ? (
        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
      ) : (
        <Hash className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block font-medium">
          {group.name}
        </span>
        {group.description && (
          <span className="text-xs text-muted-foreground truncate block">
            {group.description}
          </span>
        )}
      </div>
      {group.member_count > 0 && (
        <Badge 
          variant="secondary" 
          className={`h-5 px-1.5 text-xs flex-shrink-0 ${isSelected ? "bg-primary/20" : ""}`}
        >
          {group.member_count}
        </Badge>
      )}
    </button>
  );
}
