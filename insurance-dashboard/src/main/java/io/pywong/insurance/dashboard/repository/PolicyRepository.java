package io.pywong.insurance.dashboard.repository;

import io.pywong.insurance.dashboard.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyRepository extends JpaRepository<Policy, Long> {}
