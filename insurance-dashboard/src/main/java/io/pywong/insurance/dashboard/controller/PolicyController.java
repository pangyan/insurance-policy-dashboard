package io.pywong.insurance.dashboard.controller;

import io.pywong.insurance.dashboard.entity.Policy;
import io.pywong.insurance.dashboard.repository.PolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {
    @Autowired
    private PolicyRepository repository;

    @GetMapping
    public List<Policy> getAll() { return repository.findAll(); }

    @GetMapping("/{id}")
    public Policy getById(@PathVariable Long id) { return repository.findById(id).orElse(null); }

    @PostMapping
    public Policy create(@RequestBody Policy policy) { return repository.save(policy); }

    @PutMapping("/{id}")
    public Policy update(@PathVariable Long id, @RequestBody Policy policy) {
        policy.setId(id);
        return repository.save(policy);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repository.deleteById(id); }
}
