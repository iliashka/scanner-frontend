import React, {JSX, useState} from 'react';
import './App.css';

type Repo = {
  name: string;
  size: number;
  owner: string;
};

type RepoDetails = {
  name: string;
  size: number;
  owner: string;
  private: boolean;
  filesCount: number;
  ymlContent: string | null;
  activeHooks: any[];
};

export default function App(): JSX.Element {
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [repoDetails, setRepoDetails] = useState<RepoDetails[]>([]);

  const fetchRepos = async () => {
    setRepoDetails([]);
    setSelectedRepos([]);
    try {
      const res = await fetch(`http://localhost:3030/api/github-scanner/repos?token=${token}&user_name=${userName}`);
      const data = await res.json();
      setRepos(data);
    } catch (e) {
      console.error('Failed to fetch repositories');
    }
  };

  const fetchDetails = async () => {
    try {
      const body = JSON.stringify({
        token,
        user_name: userName,
        repo_names: selectedRepos,
      });

      const res = await fetch('http://localhost:3030/api/github-scanner/scan-repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const details: RepoDetails[] = await res.json();
      setRepoDetails(details);
    } catch (e) {
      console.error('Failed to fetch repo details');
    }
  };

  const toggleRepoSelection = (name: string) => {
    setSelectedRepos((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
      <div className="container">
        <h1>GitHub Repo Scanner</h1>

        <input
            type="text"
            placeholder="GitHub token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
        />

        <input
            type="text"
            placeholder="GitHub User name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
        />

        <button disabled={!token || !userName} onClick={fetchRepos}>
          Fetch List Repos
        </button>

        {repos.length > 0 && (
            <ul className="repo-list">
              {repos.map((repo) => (
                  <li key={repo.name}>
                    <input
                        type="checkbox"
                        checked={selectedRepos.includes(repo.name)}
                        onChange={() => toggleRepoSelection(repo.name)}
                    />
                    {repo.name} — {repo.owner} (Size: {repo.size})
                  </li>
              ))}
            </ul>
        )}

        <button
            disabled={selectedRepos.length === 0 || !token || !userName}
            onClick={fetchDetails}
        >
          Fetch Details
        </button>

        {repoDetails.length > 0 && (
            <pre>{JSON.stringify(repoDetails, null, 2)}</pre>
        )}
      </div>
  );
}
